<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnerController extends Controller
{
    /**
     * Minimal Owner-only stub proving the auth + role gate works.
     * Full Owner features are built out in later tickets.
     */
    public function dashboard(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Owner dashboard',
            'role' => $request->user()->role,
        ]);
    }
}
