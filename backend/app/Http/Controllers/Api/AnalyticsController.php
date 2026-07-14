<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Owner-only sales and best-seller analytics over Paid orders (C-24). A
 * pure reporting surface for the Owner analytics dashboard epic -- both
 * endpoints only ever consider orders whose status is Paid, dated by
 * paid_at, so Pending/Ready/Cancelled orders never contribute.
 */
class AnalyticsController extends Controller
{
    /**
     * Revenue grouped by day, for Paid orders within an optional date
     * range. Each order's revenue is the sum of quantity x menu item price
     * across its line items -- the same computation the receipt total in
     * PrintAgentClient::payloadFor() uses.
     */
    public function sales(Request $request): JsonResponse
    {
        $data = $this->validateRange($request);

        $orders = $this->paidOrdersInRange($data);

        $revenueByDate = [];

        foreach ($orders as $order) {
            $date = $order->paid_at->toDateString();
            $revenueByDate[$date] = ($revenueByDate[$date] ?? 0) + $this->orderRevenue($order);
        }

        ksort($revenueByDate);

        $result = collect($revenueByDate)
            ->map(fn (float $revenue, string $date) => [
                'date' => $date,
                'revenue' => number_format($revenue, 2, '.', ''),
            ])
            ->values();

        return response()->json($result);
    }

    /**
     * Menu items ranked by total quantity sold and total revenue generated,
     * across their appearances in Paid orders' line items within an
     * optional date range. Sorted by revenue descending by default, but
     * both metrics are present per item so the frontend can re-sort by
     * either one.
     */
    public function menuItems(Request $request): JsonResponse
    {
        $data = $this->validateRange($request);

        $orders = $this->paidOrdersInRange($data);

        $totals = [];

        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $id = $item->menu_item_id;

                $totals[$id] ??= [
                    'menu_item_id' => $id,
                    'name' => $item->menuItem->name,
                    'quantity_sold' => 0,
                    'revenue' => 0.0,
                ];

                $totals[$id]['quantity_sold'] += $item->quantity;
                $totals[$id]['revenue'] += (float) $item->menuItem->price * $item->quantity;
            }
        }

        $result = collect($totals)
            ->sortByDesc(fn (array $row) => $row['revenue'])
            ->map(fn (array $row) => [
                ...$row,
                'revenue' => number_format($row['revenue'], 2, '.', ''),
            ])
            ->values();

        return response()->json($result);
    }

    /**
     * Validate the optional from/to query params, same rule set as
     * TimeEntryController::index.
     *
     * @return array<string, string>
     */
    private function validateRange(Request $request): array
    {
        return $request->validate([
            'from' => ['sometimes', 'date'],
            'to' => ['sometimes', 'date'],
        ]);
    }

    /**
     * Paid orders within the validated range, with their line items and
     * menu items eager-loaded. "to" is a calendar date inclusive of its
     * whole day, not just its midnight instant -- same normalization as
     * TimeEntryController::index.
     *
     * @param  array<string, string>  $data
     * @return Collection<int, Order>
     */
    private function paidOrdersInRange(array $data): Collection
    {
        return Order::query()
            ->paid()
            ->paidBetween(
                $data['from'] ?? null,
                isset($data['to']) ? Carbon::parse($data['to'])->endOfDay() : null,
            )
            ->with('items.menuItem')
            ->get();
    }

    /**
     * An order's revenue: sum of quantity x menu item price across its line
     * items. Mirrors PrintAgentClient::payloadFor()'s total calculation.
     */
    private function orderRevenue(Order $order): float
    {
        return $order->items->sum(fn ($item) => (float) $item->menuItem->price * $item->quantity);
    }
}
