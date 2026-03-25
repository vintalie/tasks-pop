<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class VapidKeysController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $publicKey = config('webpush.vapid.public_key');

        if (empty($publicKey)) {
            return response()->json([
                'message' => 'Web Push não está configurado.',
            ], 503);
        }

        return response()->json(['publicKey' => $publicKey]);
    }
}
