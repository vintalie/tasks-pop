<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'recurrence',
        'due_date',
        'description',
        'requires_photo',
        'requires_observation',
        'min_interval_minutes',
        'order',
        'active',
        'sector_id',
        'shift_id',
        'user_id',
    ];

    public const RECURRENCE_SINGLE = 'single';
    public const RECURRENCE_DAILY = 'daily';
    public const RECURRENCE_WEEKLY = 'weekly';
    public const RECURRENCE_MONTHLY = 'monthly';

    protected function casts(): array
    {
        return [
            'requires_photo' => 'boolean',
            'requires_observation' => 'boolean',
            'active' => 'boolean',
            'due_date' => 'date',
        ];
    }

    public function taskLogs(): HasMany
    {
        return $this->hasMany(TaskLog::class);
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
