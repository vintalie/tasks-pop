<?php

namespace App\Jobs;

use App\Mail\TaskReminderMail;
use App\Models\Task;
use App\Models\TaskLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendTaskReminders implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private ?string $date = null
    ) {
        $this->date = $date ?? Carbon::yesterday()->toDateString();
    }

    public function handle(): void
    {
        $pending = $this->getPendingTasks($this->date);

        $managers = User::where('role', User::ROLE_MANAGER)->get();

        foreach ($managers as $manager) {
            if ($manager->email) {
                Mail::to($manager->email)->send(new TaskReminderMail($this->date, $pending));
            }
        }
    }

    private function getPendingTasks(string $date): array
    {
        $tasks = Task::with(['sector', 'shift', 'user'])
            ->where('active', true)
            ->whereIn('recurrence', ['daily', 'weekly', 'monthly'])
            ->orderBy('order')
            ->get();

        $pending = [];
        foreach ($tasks as $task) {
            if (!$this->taskAppliesOnDate($task, $date)) {
                continue;
            }

            $wasCompleted = TaskLog::where('task_id', $task->id)
                ->whereDate('log_date', $date)
                ->where('status', 'completed')
                ->exists();

            if (!$wasCompleted) {
                $pending[] = [
                    'name' => $task->name,
                    'sector' => $task->sector ? ['id' => $task->sector->id, 'name' => $task->sector->name] : null,
                    'shift' => $task->shift ? ['id' => $task->shift->id, 'name' => $task->shift->name] : null,
                    'user' => $task->user ? ['id' => $task->user->id, 'name' => $task->user->name] : null,
                ];
            }
        }

        return $pending;
    }

    private function taskAppliesOnDate(Task $task, string $date): bool
    {
        $d = Carbon::parse($date);

        return match ($task->recurrence ?? 'daily') {
            'daily' => true,
            'weekly' => true,
            'monthly' => $d->day === 1,
            'single' => $task->due_date && $task->due_date->isSameDay(Carbon::parse($date)),
            default => true,
        };
    }
}
