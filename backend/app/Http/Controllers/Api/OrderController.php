<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Events\OrderPlaced;
use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * List orders, optionally filtered by status. Open to any device --
     * Kitchen has no login, same as the /api/tables and /api/menu-items
     * read endpoints.
     *
     * This is also how a Kitchen Display recovers after a network drop:
     * on reconnect it calls GET /api/orders?status=pending to fetch every
     * order it might have missed a broadcast for, instead of relying
     * solely on real-time pushes.
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::enum(OrderStatus::class)],
        ]);

        $query = Order::with(['table', 'items.menuItem']);

        if (isset($data['status'])) {
            $query->where('status', $data['status']);
        }

        return response()->json($query->get());
    }

    /**
     * Submit a new order from the Server view. Open to any device -- Server
     * has no login, same as Kitchen.
     *
     * Writes the order and its line items in one transaction, decrements
     * each line item's linked inventory (per the C-5 decrementStock()
     * contract: quantity_required x ordered quantity), then broadcasts the
     * order to the Kitchen Display in real time on the public `kitchen`
     * channel.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'table_id' => ['required', 'integer', 'exists:tables,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_item_id' => ['required', 'integer', 'exists:menu_items,id'],
            'items.*.quantity' => ['sometimes', 'integer', 'min:1'],
        ]);

        $order = DB::transaction(function () use ($data) {
            $order = Order::create([
                'table_id' => $data['table_id'],
                'status' => OrderStatus::Pending,
            ]);

            foreach ($data['items'] as $item) {
                $menuItem = MenuItem::findOrFail($item['menu_item_id']);
                $quantity = $item['quantity'] ?? 1;

                $order->items()->create([
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $quantity,
                ]);

                foreach ($menuItem->inventoryItems as $inventoryItem) {
                    $inventoryItem->decrementStock((int) $inventoryItem->pivot->quantity_required * $quantity);
                }
            }

            return $order;
        });

        $order->load(['table', 'items.menuItem']);

        event(new OrderPlaced($order));

        return response()->json($order, 201);
    }

    /**
     * Mark an order ready/done from the Kitchen Display. Open to any device
     * -- Kitchen has no login.
     *
     * Scoped to the whole order rather than individual order items: this
     * ticket explicitly excludes course/timing sequencing, so there's no
     * requirement yet for a Kitchen to flag part of an order ready while
     * the rest is still pending. Also broadcasts the update so every
     * listening Kitchen Display reflects it immediately -- not strictly
     * required by the letter of the acceptance criteria, but it keeps every
     * screen consistent instead of drifting until the next reconnect fetch.
     */
    public function markReady(Order $order): JsonResponse
    {
        $order->update(['status' => OrderStatus::Ready]);

        $order->load(['table', 'items.menuItem']);

        event(new OrderStatusUpdated($order));

        return response()->json($order);
    }
}
