<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class StatusController extends Controller
{
    /**
     * No-auth endpoint proving the routing/middleware model supports
     * unauthenticated device-level access (the pattern Server and
     * Kitchen views use -- they are not modeled as logged-in users).
     */
    public function index(): JsonResponse
    {
        return response()->json(['status' => 'ok']);
    }
}
