<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ShiftController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Shift::query()->orderBy('start_time')->orderBy('name');
        if (!$request->boolean('all')) {
            $query->where('active', true);
        }
        $shifts = $query->get();
        return response()->json(['data' => $shifts]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:shifts,slug',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
        ]);
        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $shift = Shift::create($validated);
        return response()->json($shift, 201);
    }

    public function update(Request $request, Shift $shift): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:shifts,slug,' . $shift->id,
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'active' => 'boolean',
        ]);
        $shift->update($validated);
        return response()->json($shift);
    }

    public function destroy(Shift $shift): JsonResponse
    {
        $shift->update(['active' => false]);
        return response()->json(['message' => 'Turno desativado.']);
    }
}
