<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CashierController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\InventoryItemController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\MenuItemInventoryItemController;
use App\Http\Controllers\Api\OwnerController;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\TableController;
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

// Table layout editor (C-3). Reading the layout is open to any device (the
// same no-login pattern as /status); only the Owner may edit it.
Route::get('/tables', [TableController::class, 'index']);

Route::middleware(['auth:sanctum', 'role:owner'])->group(function () {
    Route::post('/tables', [TableController::class, 'store']);
    Route::put('/tables/{table}', [TableController::class, 'update']);
    Route::patch('/tables/{table}', [TableController::class, 'update']);
    Route::delete('/tables/{table}', [TableController::class, 'destroy']);
});

// Menu management (C-4). Reading categories and menu items is open to any
// device, same as tables above -- Server and Kitchen views read the menu
// without a login. Only the Owner may edit it.
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/menu-items', [MenuItemController::class, 'index']);

Route::middleware(['auth:sanctum', 'role:owner'])->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::patch('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    Route::post('/menu-items', [MenuItemController::class, 'store']);
    Route::put('/menu-items/{menuItem}', [MenuItemController::class, 'update']);
    Route::patch('/menu-items/{menuItem}', [MenuItemController::class, 'update']);
    Route::delete('/menu-items/{menuItem}', [MenuItemController::class, 'destroy']);
});

// Inventory tracking (C-5). Reading inventory items is open to any device,
// same as menu items and categories above. Only the Owner may create/edit/
// delete inventory items, adjust stock, or link/unlink them to menu items.
Route::get('/inventory-items', [InventoryItemController::class, 'index']);

Route::middleware(['auth:sanctum', 'role:owner'])->group(function () {
    Route::post('/inventory-items', [InventoryItemController::class, 'store']);
    Route::put('/inventory-items/{inventoryItem}', [InventoryItemController::class, 'update']);
    Route::patch('/inventory-items/{inventoryItem}', [InventoryItemController::class, 'update']);
    Route::delete('/inventory-items/{inventoryItem}', [InventoryItemController::class, 'destroy']);

    Route::post('/menu-items/{menuItem}/inventory-items', [MenuItemInventoryItemController::class, 'store']);
    Route::delete('/menu-items/{menuItem}/inventory-items/{inventoryItem}', [MenuItemInventoryItemController::class, 'destroy']);
});
