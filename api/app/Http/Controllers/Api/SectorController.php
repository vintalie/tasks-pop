<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SectorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Sector::query()->orderBy('name');
        if (!$request->boolean('all')) {
            $query->where('active', true);
        }
        $sectors = $query->get();
        return response()->json(['data' => $sectors]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:sectors,slug',
        ]);
        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $sector = Sector::create($validated);
        return response()->json($sector, 201);
    }

    public function update(Request $request, Sector $sector): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:sectors,slug,' . $sector->id,
            'active' => 'boolean',
        ]);
        $sector->update($validated);
        return response()->json($sector);
    }

    public function destroy(Sector $sector): JsonResponse
    {
        $sector->update(['active' => false]);
        return response()->json(['message' => 'Setor desativado.']);
    }
}
