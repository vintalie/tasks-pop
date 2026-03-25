<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PushSubscriptionController;
use App\Http\Controllers\Api\SectorController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaskLogController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VoiceAssistantController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/vapid-public-key', [\App\Http\Controllers\Api\VapidKeysController::class, '__invoke']);

Route::get('/debug/media', [\App\Http\Controllers\Api\DebugMediaController::class, '__invoke'])
    ->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/sectors', [SectorController::class, 'index']);
    Route::get('/shifts', [ShiftController::class, 'index']);

    Route::get('/tasks', [TaskController::class, 'index']);
    Route::get('/tasks/{task}', [TaskController::class, 'show']);

    Route::post('/push-subscriptions', [PushSubscriptionController::class, 'store']);
    Route::delete('/push-subscriptions/{id}', [PushSubscriptionController::class, 'destroy']);

    Route::get('/task-logs', [TaskLogController::class, 'index']);
    Route::post('/task-logs', [TaskLogController::class, 'store']);
    Route::post('/voice-assistant', [VoiceAssistantController::class, 'ask']);
    Route::get('/task-logs/export', [TaskLogController::class, 'export'])->middleware('manager');
    Route::put('/task-logs/{taskLog}/correct', [TaskLogController::class, 'correct'])
        ->middleware('manager');

    Route::middleware('manager')->group(function () {
        Route::get('/pending-tasks', [\App\Http\Controllers\Api\PendingTasksController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::put('/tasks/{task}', [TaskController::class, 'update']);
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);

        Route::post('/sectors', [SectorController::class, 'store']);
        Route::put('/sectors/{sector}', [SectorController::class, 'update']);
        Route::delete('/sectors/{sector}', [SectorController::class, 'destroy']);

        Route::post('/shifts', [ShiftController::class, 'store']);
        Route::put('/shifts/{shift}', [ShiftController::class, 'update']);
        Route::delete('/shifts/{shift}', [ShiftController::class, 'destroy']);

        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/ranking', [UserController::class, 'ranking']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::get('/users/{user}/stats', [UserController::class, 'stats']);
    });
});
