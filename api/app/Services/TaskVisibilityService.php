<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class TaskVisibilityService
{
    /**
     * Scope tasks visible to the given user (sector/shift/user assignment).
     */
    public function scopeVisibleToUser(Builder $query, User $user): Builder
    {
        if ($user->isManager()) {
            return $query;
        }

        return $query->where(function ($q) use ($user) {
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

    /**
     * Check if the given task is visible/completable by the user.
     */
    public function canUserAccessTask(User $user, Task $task): bool
    {
        if ($user->isManager()) {
            return true;
        }

        if ($task->user_id === $user->id) {
            return true;
        }

        if ($task->user_id !== null) {
            return false;
        }

        $sectorMatch = $task->sector_id === null || $task->sector_id === $user->sector_id;
        $shiftMatch = $task->shift_id === null || $task->shift_id === $user->shift_id;

        return $sectorMatch && $shiftMatch;
    }
}
