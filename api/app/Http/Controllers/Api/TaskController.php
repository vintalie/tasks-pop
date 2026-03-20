<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Task::query()
            ->with(['sector', 'shift', 'user'])
            ->orderBy('order')
            ->orderBy('name');

        if (!$request->boolean('all') || !$request->user()->isManager()) {
            $query->where('active', true);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Gerente vê todas; funcionário vê tarefas do seu setor/turno ou atribuídas a ele
        if (!$user->isManager()) {
            $query->where(function ($q) use ($user) {
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

        $tasks = $query->get();

        return response()->json(['data' => $tasks]);
    }

    public function show(Task $task): JsonResponse
    {
        $task->load(['sector', 'shift', 'user']);
        return response()->json($task);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:daily,weekly',
            'recurrence' => 'nullable|in:single,daily,weekly,monthly',
            'due_date' => 'nullable|date',
            'description' => 'nullable|string',
            'requires_photo' => 'boolean',
            'requires_observation' => 'boolean',
            'min_interval_minutes' => 'nullable|integer|min:0',
            'order' => 'integer',
            'sector_id' => 'nullable|exists:sectors,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $validated['requires_photo'] = $validated['requires_photo'] ?? false;
        $validated['requires_observation'] = $validated['requires_observation'] ?? false;
        $validated['order'] = $validated['order'] ?? 0;
        $validated['recurrence'] = $validated['recurrence'] ?? 'daily';

        $task = Task::create($validated);

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:daily,weekly',
            'recurrence' => 'sometimes|in:single,daily,weekly,monthly',
            'due_date' => 'nullable|date',
            'description' => 'nullable|string',
            'requires_photo' => 'boolean',
            'requires_observation' => 'boolean',
            'min_interval_minutes' => 'nullable|integer|min:0',
            'order' => 'integer',
            'active' => 'boolean',
            'sector_id' => 'nullable|exists:sectors,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $task->update($validated);

        return response()->json($task);
    }

    public function destroy(Task $task): JsonResponse
    {
        $task->delete();
        return response()->json(['message' => 'Tarefa removida.']);
    }
}
