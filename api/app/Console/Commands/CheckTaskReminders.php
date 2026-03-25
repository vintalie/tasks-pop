<?php

namespace App\Console\Commands;

use App\Jobs\SendTaskReminderNotification;
use App\Models\Task;
use App\Models\TaskLog;
use Illuminate\Console\Command;

class CheckTaskReminders extends Command
{
    protected $signature = 'tasks:check-reminders';

    protected $description = 'Verifica tarefas com horário de notificação vencido e envia lembretes';

    public function handle(): int
    {
        $now = now();
        $today = $now->toDateString();
        $currentTime = $now->format('H:i');

        $tasks = Task::whereNotNull('notification_time')
            ->where('notification_time', '<=', $currentTime)
            ->where('type', 'daily')
            ->where('active', true)
            ->get();

        $sent = 0;

        foreach ($tasks as $task) {
            $hasCompletedLog = TaskLog::where('task_id', $task->id)
                ->whereDate('log_date', $today)
                ->where('status', 'completed')
                ->exists();

            if (! $hasCompletedLog) {
                SendTaskReminderNotification::dispatch($task, $today);
                $sent++;
            }
        }

        if ($sent > 0) {
            $this->info("Enviados $sent lembretes de tarefa.");
        }

        return self::SUCCESS;
    }
}
