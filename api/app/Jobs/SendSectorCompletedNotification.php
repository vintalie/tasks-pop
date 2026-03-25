<?php

namespace App\Jobs;

use App\Models\Sector;
use App\Models\User;
use App\Services\WebPushService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendSectorCompletedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected Sector $sector,
        protected string $logDate
    ) {}

    public function handle(WebPushService $webPush): void
    {
        $managerIds = User::where('role', 'manager')->pluck('id')->all();

        if (empty($managerIds)) {
            return;
        }

        $webPush->sendToUsers(
            $managerIds,
            'Setor finalizou',
            sprintf('O setor "%s" finalizou todas as tarefas do dia.', $this->sector->name),
            ['tag' => 'sector-completed-'.$this->sector->id, 'url' => '/dashboard']
        );
    }
}
