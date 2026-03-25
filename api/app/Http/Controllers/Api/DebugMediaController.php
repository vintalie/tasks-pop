<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DebugMediaController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $logId = $request->query('log_id');
        $logs = $logId
            ? TaskLog::with(['task', 'user'])->where('id', $logId)->get()
            : TaskLog::with(['task', 'user'])->where(function ($q) {
                $q->whereNotNull('photo_path')->orWhereNotNull('media_paths');
            })->latest()->take(5)->get();

        $controller = app(\App\Http\Controllers\Api\TaskLogController::class);

        $result = [
            'env' => [
                'app_url' => config('app.url'),
                'request_host' => $request->getHost(),
                'request_port' => $request->getPort(),
                'request_scheme' => $request->getScheme(),
                'expected_storage_base' => $request->getScheme().'://'.$request->getHost().(in_array($request->getPort(), [80, 443]) ? '' : ':'.$request->getPort()).'/storage',
            ],
            'logs' => [],
        ];

        foreach ($logs as $log) {
            $mediaPaths = $log->media_paths;
            $photoPath = $log->photo_path;

            $apiMedia = $controller->getMediaArrayForLog($log);

            $fileExists = false;
            $relativePath = null;
            if ($photoPath && ! str_starts_with($photoPath, 'http')) {
                $relativePath = $photoPath;
                $fileExists = Storage::disk('public')->exists($photoPath);
            } elseif (! empty($mediaPaths) && is_array($mediaPaths)) {
                $first = $mediaPaths[0] ?? null;
                $urlOrPath = $first['url'] ?? $first['path'] ?? null;
                if ($urlOrPath) {
                    if (str_starts_with($urlOrPath, 'http')) {
                        $relativePath = preg_replace('#^https?://[^/]+/storage/#', '', $urlOrPath);
                        $fileExists = $relativePath ? Storage::disk('public')->exists($relativePath) : false;
                    } else {
                        $relativePath = str_starts_with($urlOrPath, 'storage/') ? substr($urlOrPath, 8) : $urlOrPath;
                        $fileExists = Storage::disk('public')->exists($relativePath);
                    }
                }
            }

            $result['logs'][] = [
                'id' => $log->id,
                'task_name' => $log->task->name ?? null,
                'user_name' => $log->user->name ?? null,
                'log_date' => $log->log_date?->format('Y-m-d'),
                'raw' => [
                    'photo_path' => $photoPath,
                    'media_paths' => $mediaPaths,
                ],
                'api_returns' => [
                    'media' => $apiMedia,
                ],
                'file_check' => [
                    'relative_path' => $relativePath,
                    'exists' => $fileExists,
                ],
            ];
        }

        return response()->json($result);
    }
}
