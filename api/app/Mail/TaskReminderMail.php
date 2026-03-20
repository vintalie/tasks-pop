<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TaskReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $date,
        public array $pendingTasks
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tasks POP - Tarefas pendentes em ' . $this->date,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.task-reminder',
        );
    }
}
