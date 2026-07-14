<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Owner-only inventory threshold and restock reporting (C-25). A pure
 * reporting/override surface for the Owner analytics dashboard epic,
 * mirroring AnalyticsController's Paid-order-only convention (C-24) --
 * everything here is computed fresh on each request, no stored snapshot or
 * scheduled job.
 */
class RestockController extends Controller
{
    /**
     * Every inventory item's current stock, its set threshold, a suggested
     * threshold derived from the trailing 30 days of Paid-order consumption,
     * and the shortfall (how much stock is needed to reach the set
     * threshold, 0 if already at or above it).
     *
     * Combined into one payload -- rather than separate suggested-threshold
     * and live-restock endpoints -- since a frontend restock view needs all
     * of this together.
     */
    public function index(): JsonResponse
    {
        $consumption = $this->consumptionByInventoryItem();

        $result = InventoryItem::all()->map(fn (InventoryItem $inventoryItem) => [
            'id' => $inventoryItem->id,
            'name' => $inventoryItem->name,
            'stock' => $inventoryItem->stock,
            'threshold' => $inventoryItem->threshold,
            'suggested_threshold' => $this->suggestedThreshold($consumption[$inventoryItem->id] ?? 0),
            'shortfall' => max(0, $inventoryItem->threshold - $inventoryItem->stock),
        ]);

        return response()->json($result->values());
    }

    /**
     * Override an inventory item's threshold directly.
     */
    public function update(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $data = $request->validate([
            'threshold' => ['required', 'integer', 'min:0'],
        ]);

        $inventoryItem->update($data);

        return response()->json($inventoryItem);
    }

    /**
     * Suggested threshold from trailing-30-day average daily consumption,
     * rounded up: enough stock on hand to not run out before the next
     * restock, rather than rounding down to a figure that could still leave
     * a shortfall on an average day.
     */
    private function suggestedThreshold(int $totalConsumedInWindow): int
    {
        if ($totalConsumedInWindow === 0) {
            return 0;
        }

        return (int) ceil($totalConsumedInWindow / 30);
    }

    /**
     * Total units consumed per inventory item across every Paid order's
     * line items in the trailing 30 days, by walking each order item's menu
     * item to the inventory items it requires and multiplying the order
     * item's quantity by the pivot's quantity_required.
     *
     * @return array<int, int>
     */
    private function consumptionByInventoryItem(): array
    {
        $orders = Order::query()
            ->paid()
            ->where('paid_at', '>=', now()->subDays(30))
            ->with('items.menuItem.inventoryItems')
            ->get();

        $consumption = [];

        foreach ($orders as $order) {
            foreach ($order->items as $orderItem) {
                foreach ($orderItem->menuItem->inventoryItems as $inventoryItem) {
                    $consumption[$inventoryItem->id] = ($consumption[$inventoryItem->id] ?? 0)
                        + $inventoryItem->pivot->quantity_required * $orderItem->quantity;
                }
            }
        }

        return $consumption;
    }
}
