<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PendingTasksController extends Controller
{
    /**
     * Tarefas que deveriam ter sido feitas ontem mas não foram.
     */
    public function index(Request $request): JsonResponse
    {
        $yesterday = Carbon::yesterday()->toDateString();

        $tasks = Task::with(['sector', 'shift', 'user'])
            ->where('active', true)
            ->whereIn('recurrence', ['daily', 'weekly', 'monthly'])
            ->orderBy('order')
            ->get();

        $pending = [];
        foreach ($tasks as $task) {
            if (!$this->taskAppliesOnDate($task, $yesterday)) {
                continue;
            }

            $wasCompleted = TaskLog::where('task_id', $task->id)
                ->whereDate('log_date', $yesterday)
                ->where('status', 'completed')
                ->exists();

            if (!$wasCompleted) {
                $pending[] = [
                    'id' => $task->id,
                    'name' => $task->name,
                    'sector' => $task->sector ? ['id' => $task->sector->id, 'name' => $task->sector->name] : null,
                    'shift' => $task->shift ? ['id' => $task->shift->id, 'name' => $task->shift->name] : null,
                    'user' => $task->user ? ['id' => $task->user->id, 'name' => $task->user->name] : null,
                ];
            }
        }

        return response()->json([
            'date' => $yesterday,
            'data' => $pending,
        ]);
    }

    private function taskAppliesOnDate(Task $task, string $date): bool
    {
        $d = Carbon::parse($date);

        return match ($task->recurrence ?? 'daily') {
            'daily' => true,
            'weekly' => true, // TODO: adicionar day_of_week na task para filtrar
            'monthly' => $d->day === 1,
            'single' => $task->due_date && $task->due_date->isSameDay(Carbon::parse($date)),
            default => true,
        };
    }
}
