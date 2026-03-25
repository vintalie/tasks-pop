<?php

namespace App\Services;

use App\Models\Sector;
use App\Models\Task;
use App\Models\TaskLog;

class SectorCompletionService
{
    /**
     * Verifica se todas as tarefas diárias do setor foram concluídas na data.
     * Considera apenas tarefas com sector_id definido (tarefas do setor).
     */
    public function isSectorCompleted(?int $sectorId, string $logDate): bool
    {
        if ($sectorId === null) {
            return false;
        }

        $tasks = Task::where('sector_id', $sectorId)
            ->where('active', true)
            ->where('type', 'daily')
            ->get();

        if ($tasks->isEmpty()) {
            return false;
        }

        foreach ($tasks as $task) {
            $completed = TaskLog::where('task_id', $task->id)
                ->whereDate('log_date', $logDate)
                ->where('status', 'completed')
                ->exists();

            if (! $completed) {
                return false;
            }
        }

        return true;
    }
}
