<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CashierController;
use App\Http\Controllers\Api\OwnerController;
use App\Http\Controllers\Api\StatusController;
use Illuminate\Support\Facades\Route;

// Owner and Cashier authenticate here; Server and Kitchen have no login.
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Owner-only and Cashier-only stubs proving the auth + role gate works.
// The real Owner/Cashier features are built out in later tickets.
Route::middleware(['auth:sanctum', 'role:owner'])->get('/owner/dashboard', [OwnerController::class, 'dashboard']);
Route::middleware(['auth:sanctum', 'role:cashier'])->get('/cashier/dashboard', [CashierController::class, 'dashboard']);

// No-auth route: the pattern Server and Kitchen views use (device-level
// access, no login). Proves unauthenticated routes can coexist with the
// auth+role-gated ones above.
Route::get('/status', [StatusController::class, 'index']);
