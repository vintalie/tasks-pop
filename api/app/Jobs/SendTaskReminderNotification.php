<?php

namespace App\Jobs;

use App\Models\Task;
use App\Models\User;
use App\Services\TaskVisibilityService;
use App\Services\WebPushService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendTaskReminderNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected Task $task,
        protected string $logDate
    ) {}

    public function handle(WebPushService $webPush, TaskVisibilityService $taskVisibility): void
    {
        $userIds = User::where('role', 'employee')
            ->get()
            ->filter(fn (User $u) => $taskVisibility->canUserAccessTask($u, $this->task))
            ->pluck('id')
            ->all();

        if (empty($userIds)) {
            return;
        }

        $webPush->sendToUsers(
            $userIds,
            'Lembrete de tarefa',
            sprintf('A tarefa "%s" ainda não foi concluída.', $this->task->name),
            ['tag' => 'task-reminder-'.$this->task->id, 'url' => '/']
        );
    }
}
