<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string|max:500',
            'keys' => 'required|array',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $user = $request->user();

        $subscription = PushSubscription::updateOrCreate(
            [
                'user_id' => $user->id,
                'endpoint' => $validated['endpoint'],
            ],
            [
                'keys' => $validated['keys'],
                'user_agent' => $request->userAgent(),
            ]
        );

        return response()->json(['id' => $subscription->id], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = PushSubscription::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->delete();

        if (! $deleted) {
            return response()->json(['message' => 'Subscription not found'], 404);
        }

        return response()->json(['message' => 'Subscription removed']);
    }
}
