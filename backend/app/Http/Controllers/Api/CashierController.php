<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashierController extends Controller
{
    /**
     * Minimal Cashier-only stub proving the auth + role gate works.
     * Full Cashier features (checkout/payment/cancel) are built out in later tickets.
     */
    public function dashboard(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Cashier dashboard',
            'role' => $request->user()->role,
        ]);
    }
}
