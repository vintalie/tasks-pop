<?php

namespace App\Http\Controllers\Api;

use App\Exports\TaskLogsExport;
use App\Helpers\StorageUrlHelper;
use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskLog;
use App\Events\TaskLogCreated;
use App\Jobs\SendSectorCompletedNotification;
use App\Models\Sector;
use App\Services\MediaStorageService;
use App\Services\PhotoStorageService;
use App\Services\SectorCompletionService;
use App\Services\TaskVisibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class TaskLogController extends Controller
{
    public function __construct(
        protected MediaStorageService $mediaStorage,
        protected PhotoStorageService $photoStorage,
        protected TaskVisibilityService $taskVisibility,
        protected SectorCompletionService $sectorCompletion
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = TaskLog::with(['task.sector', 'task.shift', 'user.sector', 'user.shift']);

        if ($request->has('date')) {
            $query->whereDate('log_date', $request->date);
        }
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        } elseif ($request->user()->isManager()) {
            // Manager sees all; employee sees only own
        } else {
            $query->where('user_id', $request->user()->id);
        }
        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $logs = $query->orderBy('log_date', 'desc')->orderBy('completed_at', 'desc')->get();

        $data = $logs->map(function (TaskLog $log) {
            return [
                'id' => $log->id,
                'task' => [
                    'id' => $log->task->id,
                    'name' => $log->task->name,
                    'type' => $log->task->type,
                    'sector' => $log->task->sector ? ['id' => $log->task->sector->id, 'name' => $log->task->sector->name] : null,
                    'shift' => $log->task->shift ? ['id' => $log->task->shift->id, 'name' => $log->task->shift->name] : null,
                ],
                'user' => [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'sector' => $log->user->sector ? ['id' => $log->user->sector->id, 'name' => $log->user->sector->name] : null,
                    'shift' => $log->user->shift ? ['id' => $log->user->shift->id, 'name' => $log->user->shift->name] : null,
                ],
                'log_date' => $log->log_date->format('Y-m-d'),
                'completed_at' => $log->completed_at?->toIso8601String(),
                'observation' => $log->observation,
                'photo_url' => $this->getFirstMediaUrl($log),
                'media' => $this->getMediaArray($log),
                'status' => $log->status,
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'status' => 'required|in:completed,pending',
            'observation' => 'nullable|string|max:1000',
            'photo' => 'nullable|image|max:10240',
            'media' => 'nullable|array',
            'media.*' => 'file|mimes:jpeg,png,gif,webp,mp4,webm,mov|max:51200',
        ]);

        $task = Task::findOrFail($validated['task_id']);
        $user = $request->user();

        if (! $this->taskVisibility->canUserAccessTask($user, $task)) {
            return response()->json([
                'message' => 'Você não tem permissão para registrar esta tarefa.',
                'errors' => ['task_id' => ['Tarefa não encontrada ou não visível para você.']],
            ], 403);
        }

        $logDate = now()->toDateString();

        if ($validated['status'] === 'completed' && $task->min_interval_minutes) {
            $lastCompleted = TaskLog::where('user_id', $user->id)
                ->where('task_id', $task->id)
                ->where('status', 'completed')
                ->whereNotNull('completed_at')
                ->orderBy('completed_at', 'desc')
                ->first();
            if ($lastCompleted && $lastCompleted->completed_at->addMinutes($task->min_interval_minutes)->isFuture()) {
                return response()->json([
                    'message' => 'Aguarde ' . $task->min_interval_minutes . ' minutos entre conclusões desta tarefa.',
                    'errors' => ['interval' => ['Tempo mínimo não respeitado.']],
                ], 422);
            }
        }

        $mediaFiles = $this->collectMediaFiles($request);
        $hasMedia = $request->hasFile('photo') || count($mediaFiles) > 0;

        if ($validated['status'] === 'completed' && $task->requires_photo && ! $hasMedia) {
            return response()->json([
                'message' => 'Esta tarefa exige mídia (foto ou vídeo) como comprovante.',
                'errors' => ['media' => ['Mídia obrigatória para tarefas críticas.']],
            ], 422);
        }

        if ($validated['status'] === 'completed' && $task->requires_observation) {
            $observation = trim($validated['observation'] ?? '');
            if ($observation === '') {
                return response()->json([
                    'message' => 'Esta tarefa exige uma observação.',
                    'errors' => ['observation' => ['Observação obrigatória para esta tarefa.']],
                ], 422);
            }
        }

        $mediaPaths = [];
        if ($request->hasFile('photo')) {
            $stored = $this->mediaStorage->store($request->file('photo'));
            if ($stored) {
                $mediaPaths[] = $stored;
            }
        }
        foreach ($mediaFiles as $file) {
            $stored = $this->mediaStorage->store($file);
            if ($stored) {
                $mediaPaths[] = $stored;
            }
        }

        $log = TaskLog::where('user_id', $user->id)
            ->where('task_id', $validated['task_id'])
            ->whereDate('log_date', $logDate)
            ->first();

        $attributes = [
            'status' => $validated['status'],
            'observation' => $validated['observation'] ?? null,
            'photo_path' => ! empty($mediaPaths) ? ($mediaPaths[0]['url'] ?? null) : null,
            'media_paths' => ! empty($mediaPaths) ? $mediaPaths : null,
            'completed_at' => $validated['status'] === 'completed' ? now() : null,
        ];

        if ($log) {
            $log->update($attributes);
        } else {
            $log = TaskLog::create([
                'user_id' => $user->id,
                'task_id' => $validated['task_id'],
                'log_date' => $logDate,
                ...$attributes,
            ]);
        }

        $log->load(['task', 'user']);

        if (config('broadcasting.default') !== 'null') {
            TaskLogCreated::dispatch(
                $log->id,
                $task->id,
                $task->sector_id,
                $task->shift_id,
                $logDate
            );
        }

        if ($validated['status'] === 'completed' && $task->sector_id) {
            $sector = Sector::find($task->sector_id);
            if ($sector && $this->sectorCompletion->isSectorCompleted($task->sector_id, $logDate)) {
                SendSectorCompletedNotification::dispatch($sector, $logDate);
            }
        }

        return response()->json([
            'data' => [
                'id' => $log->id,
                'task' => ['id' => $log->task->id, 'name' => $log->task->name],
                'user' => ['id' => $log->user->id, 'name' => $log->user->name],
                'log_date' => $log->log_date->format('Y-m-d'),
                'completed_at' => $log->completed_at?->toIso8601String(),
                'observation' => $log->observation,
                'photo_url' => $this->getFirstMediaUrl($log),
                'media' => $this->getMediaArray($log),
                'status' => $log->status,
            ],
        ], 201);
    }

    public function correct(Request $request, TaskLog $taskLog): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:completed,pending',
            'correction_reason' => 'required|string|max:500',
        ]);

        $taskLog->update([
            'status' => $validated['status'],
            'corrected_at' => now(),
            'correction_reason' => $validated['correction_reason'],
            'corrected_by' => $request->user()->id,
            'completed_at' => $validated['status'] === 'completed' ? now() : null,
        ]);

        $taskLog->load(['task', 'user']);

        return response()->json([
            'data' => [
                'id' => $taskLog->id,
                'status' => $taskLog->status,
                'corrected_at' => $taskLog->corrected_at->toIso8601String(),
            ],
        ]);
    }

    public function export(Request $request): BinaryFileResponse|\Illuminate\Http\Response
    {
        $query = TaskLog::with(['task.sector', 'task.shift', 'user.sector', 'user.shift']);

        if ($request->has('date')) {
            $query->whereDate('log_date', $request->date);
        }
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $logs = $query->orderBy('log_date')->orderBy('completed_at')->get();

        $format = $request->get('format', 'csv');

        if ($format === 'xlsx') {
            return Excel::download(
                new TaskLogsExport($logs),
                'task-logs-' . ($request->get('date', now()->toDateString())) . '.xlsx',
                \Maatwebsite\Excel\Excel::XLSX
            );
        }

        return Excel::download(
            new TaskLogsExport($logs),
            'task-logs-' . ($request->get('date', now()->toDateString())) . '.csv',
            \Maatwebsite\Excel\Excel::CSV,
            ['Content-Type' => 'text/csv; charset=UTF-8']
        );
    }

    protected function collectMediaFiles(Request $request): array
    {
        $files = $request->file('media');

        if (is_array($files)) {
            $filtered = array_values(array_filter($files, fn ($f) => $f instanceof UploadedFile));
            if (! empty($filtered)) {
                return $filtered;
            }
        }

        if ($files instanceof UploadedFile) {
            return [$files];
        }

        // Fallback: FormData com media[] pode chegar como media.0, media.1 em alguns casos
        $collected = [];
        $i = 0;
        while (($f = $request->file("media.{$i}")) instanceof UploadedFile) {
            $collected[] = $f;
            $i++;
        }

        return $collected;
    }

    protected function getMediaArray(TaskLog $log): array
    {
        $media = $log->media_paths;
        if (is_array($media) && ! empty($media)) {
            return $this->normalizeMediaUrls($media);
        }

        $url = $this->photoStorage->url($log->photo_path);
        if ($url) {
            return [['url' => StorageUrlHelper::fixStorageUrl($url), 'type' => 'image']];
        }

        return [];
    }

    /**
     * Garante que todas as URLs de mídia sejam absolutas para o frontend exibir corretamente.
     */
    protected function normalizeMediaUrls(array $media): array
    {
        return array_map(function (array $item): array {
            $url = $item['url'] ?? $item['path'] ?? null;
            if ($url && ! str_starts_with((string) $url, 'http://') && ! str_starts_with((string) $url, 'https://')) {
                $url = $this->mediaStorage->url($url);
            }
            $url = $url ? StorageUrlHelper::fixStorageUrl($url) : '';

            return [
                'url' => $url,
                'type' => $item['type'] ?? 'image',
            ];
        }, $media);
    }

    public function getMediaArrayForLog(TaskLog $log): array
    {
        return $this->getMediaArray($log);
    }

    protected function getFirstMediaUrl(TaskLog $log): ?string
    {
        $media = $this->getMediaArray($log);
        $first = $media[0] ?? null;

        return $first['url'] ?? null;
    }
}
