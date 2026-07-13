<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuItemInventoryItemController extends Controller
{
    /**
     * Link a menu item to an inventory item it requires, e.g. making a
     * Cheeseburger consumes 1 Beef Patty. Owner-only.
     *
     * Re-posting the same pair updates `quantity_required` instead of
     * creating a duplicate link. Linking to an already out-of-stock
     * inventory item immediately re-syncs the menu item's availability.
     */
    public function store(Request $request, MenuItem $menuItem): JsonResponse
    {
        $data = $request->validate([
            'inventory_item_id' => ['required', 'integer', 'exists:inventory_items,id'],
            'quantity_required' => ['sometimes', 'integer', 'min:1'],
        ]);

        $menuItem->inventoryItems()->syncWithoutDetaching([
            $data['inventory_item_id'] => ['quantity_required' => $data['quantity_required'] ?? 1],
        ]);

        $menuItem->syncAvailability();

        return response()->json($menuItem->load('inventoryItems'), 201);
    }

    /**
     * Unlink a menu item from an inventory item it no longer requires.
     * Owner-only.
     */
    public function destroy(MenuItem $menuItem, InventoryItem $inventoryItem): JsonResponse
    {
        $menuItem->inventoryItems()->detach($inventoryItem->id);

        $menuItem->syncAvailability();

        return response()->json(null, 204);
    }
}
