<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'task_id',
        'log_date',
        'completed_at',
        'observation',
        'photo_path',
        'media_paths',
        'status',
        'corrected_at',
        'correction_reason',
        'corrected_by',
    ];

    protected function casts(): array
    {
        return [
            'log_date' => 'date',
            'completed_at' => 'datetime',
            'corrected_at' => 'datetime',
            'media_paths' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function correctedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'corrected_by');
    }
}
