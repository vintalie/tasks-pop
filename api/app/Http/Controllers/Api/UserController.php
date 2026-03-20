<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['sector', 'shift'])->orderBy('name');
        if (!$request->boolean('all')) {
            $query->where('role', User::ROLE_EMPLOYEE);
        }
        $users = $query->get();

        $data = $users->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->role,
            'sector' => $u->sector ? ['id' => $u->sector->id, 'name' => $u->sector->name] : null,
            'shift' => $u->shift ? ['id' => $u->shift->id, 'name' => $u->shift->name] : null,
        ]);

        return response()->json(['data' => $data]);
    }

    public function ranking(Request $request): JsonResponse
    {
        $period = $request->get('period', 'week'); // week | month
        $start = $period === 'month'
            ? Carbon::now()->subMonth()->startOfDay()
            : Carbon::now()->subWeek()->startOfDay();

        $users = User::with(['sector', 'shift'])
            ->where('role', User::ROLE_EMPLOYEE)
            ->get();

        $ranking = $users->map(function (User $user) use ($start) {
            $total = TaskLog::where('user_id', $user->id)
                ->where('created_at', '>=', $start)
                ->count();
            $completed = TaskLog::where('user_id', $user->id)
                ->where('status', 'completed')
                ->where('created_at', '>=', $start)
                ->count();
            $percentage = $total > 0 ? round(($completed / $total) * 100, 1) : 0;

            return [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'sector' => $user->sector ? ['id' => $user->sector->id, 'name' => $user->sector->name] : null,
                    'shift' => $user->shift ? ['id' => $user->shift->id, 'name' => $user->shift->name] : null,
                ],
                'total_tasks' => $total,
                'completed_tasks' => $completed,
                'completion_percentage' => $percentage,
            ];
        })->sortByDesc('completion_percentage')->values()->map(function ($item, $index) {
            $item['rank'] = $index + 1;
            return $item;
        })->toArray();

        return response()->json([
            'period' => $period,
            'data' => $ranking,
        ]);
    }

    public function stats(User $user): JsonResponse
    {
        $total = TaskLog::where('user_id', $user->id)->count();
        $completed = TaskLog::where('user_id', $user->id)->where('status', 'completed')->count();
        $percentage = $total > 0 ? round(($completed / $total) * 100, 1) : 0;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
            ],
            'total_tasks' => $total,
            'completed_tasks' => $completed,
            'completion_percentage' => $percentage,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:employee,manager',
            'sector_id' => 'nullable|exists:sectors,id',
            'shift_id' => 'nullable|exists:shifts,id',
        ]);
        $validated['password'] = bcrypt($validated['password']);
        $user = User::create($validated);
        $user->load(['sector', 'shift']);
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'sector' => $user->sector ? ['id' => $user->sector->id, 'name' => $user->sector->name] : null,
            'shift' => $user->shift ? ['id' => $user->shift->id, 'name' => $user->shift->name] : null,
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|in:employee,manager',
            'sector_id' => 'nullable|exists:sectors,id',
            'shift_id' => 'nullable|exists:shifts,id',
        ]);
        if (!empty($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }
        $user->update($validated);
        $user->load(['sector', 'shift']);
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'sector' => $user->sector ? ['id' => $user->sector->id, 'name' => $user->sector->name] : null,
            'shift' => $user->shift ? ['id' => $user->shift->id, 'name' => $user->shift->name] : null,
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Não é possível remover seu próprio usuário.'], 422);
        }
        $user->delete();
        return response()->json(['message' => 'Usuário removido.']);
    }
}
