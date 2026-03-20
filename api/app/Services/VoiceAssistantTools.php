<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskLog;
use App\Models\User;
use Carbon\Carbon;

class VoiceAssistantTools
{
    public static function getToolsDefinition(): array
    {
        return [
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_pending_tasks',
                    'description' => 'Retorna as tarefas do dia que ainda não foram concluídas pelo usuário. Use quando o usuário perguntar quais tarefas faltam, o que falta fazer, etc.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'date' => [
                                'type' => 'string',
                                'description' => 'Data no formato Y-m-d (ex: 2025-03-20). Opcional, usa hoje se não informado.',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_completed_tasks',
                    'description' => 'Retorna as tarefas já concluídas pelo usuário na data. Use quando o usuário perguntar o que já fez, tarefas concluídas, etc.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'date' => [
                                'type' => 'string',
                                'description' => 'Data no formato Y-m-d. Opcional, usa hoje se não informado.',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_all_tasks_today',
                    'description' => 'Retorna resumo completo: tarefas pendentes e concluídas do dia. Use para visão geral.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'date' => [
                                'type' => 'string',
                                'description' => 'Data no formato Y-m-d. Opcional.',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_task_details',
                    'description' => 'Retorna detalhes de uma tarefa específica: nome, descrição, se exige foto ou observação. Use quando o usuário pedir explicação sobre uma tarefa.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'task_name' => [
                                'type' => 'string',
                                'description' => 'Nome ou parte do nome da tarefa (ex: "limpar máquina", "higienizar").',
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    public static function execute(string $name, array $args, User $user): string
    {
        $date = $args['date'] ?? Carbon::today()->toDateString();

        return match ($name) {
            'get_pending_tasks' => self::getPendingTasks($user, $date),
            'get_completed_tasks' => self::getCompletedTasks($user, $date),
            'get_all_tasks_today' => self::getAllTasksToday($user, $date),
            'get_task_details' => self::getTaskDetails($user, $args['task_name'] ?? ''),
            default => json_encode(['error' => 'Tool desconhecida: ' . $name]),
        };
    }

    private static function getTasksForUser(User $user, string $date): array
    {
        $query = Task::query()
            ->with(['sector', 'shift', 'user'])
            ->where('active', true)
            ->orderBy('order')
            ->orderBy('name');

        if (!$user->isManager()) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere(function ($sq) use ($user) {
                        $sq->whereNull('user_id')
                            ->where(function ($sectorShift) use ($user) {
                                $sectorShift->where(function ($ss) use ($user) {
                                    $ss->whereNull('sector_id');
                                    if ($user->sector_id) {
                                        $ss->orWhere('sector_id', $user->sector_id);
                                    }
                                })->where(function ($ss) use ($user) {
                                    $ss->whereNull('shift_id');
                                    if ($user->shift_id) {
                                        $ss->orWhere('shift_id', $user->shift_id);
                                    }
                                });
                            });
                    });
            });
        }

        $tasks = $query->get();
        $filtered = [];
        foreach ($tasks as $task) {
            if (self::taskAppliesOnDate($task, $date)) {
                $filtered[] = $task;
            }
        }

        return $filtered;
    }

    private static function taskAppliesOnDate(Task $task, string $date): bool
    {
        $d = Carbon::parse($date);

        return match ($task->recurrence ?? 'daily') {
            'daily' => true,
            'weekly' => true,
            'monthly' => $d->day === 1,
            'single' => $task->due_date && $task->due_date->isSameDay($d),
            default => true,
        };
    }

    private static function getPendingTasks(User $user, string $date): string
    {
        $tasks = self::getTasksForUser($user, $date);
        $pending = [];

        foreach ($tasks as $task) {
            $completed = TaskLog::where('task_id', $task->id)
                ->where('user_id', $user->id)
                ->whereDate('log_date', $date)
                ->where('status', 'completed')
                ->exists();

            if (!$completed) {
                $pending[] = [
                    'name' => $task->name,
                    'sector' => $task->sector?->name,
                    'shift' => $task->shift?->name,
                ];
            }
        }

        return json_encode([
            'date' => $date,
            'count' => count($pending),
            'tasks' => $pending,
        ], JSON_UNESCAPED_UNICODE);
    }

    private static function getCompletedTasks(User $user, string $date): string
    {
        $logs = TaskLog::where('user_id', $user->id)
            ->whereDate('log_date', $date)
            ->where('status', 'completed')
            ->with('task')
            ->orderBy('completed_at')
            ->get();

        $completed = [];
        foreach ($logs as $log) {
            $completed[] = [
                'name' => $log->task->name,
                'completed_at' => $log->completed_at?->format('H:i'),
            ];
        }

        return json_encode([
            'date' => $date,
            'count' => count($completed),
            'tasks' => $completed,
        ], JSON_UNESCAPED_UNICODE);
    }

    private static function getAllTasksToday(User $user, string $date): string
    {
        $pendingData = json_decode(self::getPendingTasks($user, $date), true);
        $completedData = json_decode(self::getCompletedTasks($user, $date), true);

        return json_encode([
            'date' => $date,
            'pending' => $pendingData['tasks'] ?? [],
            'pending_count' => $pendingData['count'] ?? 0,
            'completed' => $completedData['tasks'] ?? [],
            'completed_count' => $completedData['count'] ?? 0,
        ], JSON_UNESCAPED_UNICODE);
    }

    private static function getTaskDetails(User $user, string $taskName): string
    {
        if (empty(trim($taskName))) {
            return json_encode(['error' => 'Informe o nome da tarefa.'], JSON_UNESCAPED_UNICODE);
        }

        $task = Task::query()
            ->with(['sector', 'shift'])
            ->where('active', true)
            ->where('name', 'like', '%' . $taskName . '%')
            ->first();

        if (!$task) {
            return json_encode(['error' => 'Tarefa não encontrada.'], JSON_UNESCAPED_UNICODE);
        }

        return json_encode([
            'name' => $task->name,
            'description' => $task->description,
            'requires_photo' => (bool) $task->requires_photo,
            'requires_observation' => (bool) $task->requires_observation,
            'sector' => $task->sector?->name,
            'shift' => $task->shift?->name,
        ], JSON_UNESCAPED_UNICODE);
    }
}
