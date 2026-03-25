<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskLogCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $logId,
        public int $taskId,
        public ?int $sectorId,
        public ?int $shiftId,
        public string $logDate
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('tasks-daily'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'task-log.created';
    }

    public function broadcastWith(): array
    {
        return [
            'log_id' => $this->logId,
            'task_id' => $this->taskId,
            'log_date' => $this->logDate,
        ];
    }
}
