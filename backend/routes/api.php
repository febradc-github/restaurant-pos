<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CashierController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\InventoryItemController;
use App\Http\Controllers\Api\KitchenClockController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\MenuItemInventoryItemController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OwnerController;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\TimeEntryController;
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

// Order taking & Kitchen Display (C-6). Both Server (order-taking) and
// Kitchen (ready/done + reconnect catch-up) are no-login devices, same
// access pattern as tables, menu items, and inventory items above.
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::patch('/orders/{order}/ready', [OrderController::class, 'markReady']);

// Checkout, payment confirmation & cancellation (C-7). Unlike Server/
// Kitchen above, this is a real transaction the Cashier is accountable
// for, so it's role-gated rather than open to any device.
Route::middleware(['auth:sanctum', 'role:cashier'])->group(function () {
    Route::patch('/orders/{order}/checkout', [OrderController::class, 'checkout']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
});

// Kitchen PIN clock-in/out (C-12). No login, no Sanctum token, same
// no-auth pattern as /status and /orders above -- identified purely by a
// PIN submitted with each request, not by a session.
Route::post('/kitchen/clock', [KitchenClockController::class, 'clock']);

// Attendance query surface (C-13). Owner-only, same role-gate pattern as
// /owner/dashboard above. A pure data/query endpoint over time_entries for
// the not-yet-built Owner analytics dashboard epic -- no aggregation or
// reporting UI here.
Route::middleware(['auth:sanctum', 'role:owner'])->get('/time-entries', [TimeEntryController::class, 'index']);

// Employee management (C-21). Owner-only, same role-gate pattern as the
// other Owner-only endpoints above. Deactivating/reactivating an employee
// never deletes the users row, so their historical time_entries and orders
// rows are untouched.
Route::middleware(['auth:sanctum', 'role:owner'])->group(function () {
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::patch('/employees/{user}', [EmployeeController::class, 'update']);
    Route::patch('/employees/{user}/deactivate', [EmployeeController::class, 'deactivate']);
    Route::patch('/employees/{user}/reactivate', [EmployeeController::class, 'reactivate']);
});
