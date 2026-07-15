<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Events\OrderPlaced;
use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Order;
use App\Services\Checkout\PaymentConfirmationService;
use App\Services\Receipts\PrintAgentClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function __construct(
        private readonly PaymentConfirmationService $paymentConfirmation,
        private readonly PrintAgentClient $printAgent,
    ) {}

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
            'items.*.notes' => ['nullable', 'string', 'max:500'],
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
                    'notes' => $item['notes'] ?? null,
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

    /**
     * Cashier checks an order out: confirms a payment method (cash, QR Ph,
     * or GCash) was received and marks the order paid (C-7). Role-gated to
     * Cashier -- unlike the no-login Server/Kitchen endpoints above, this
     * is a real transaction the Cashier is accountable for.
     *
     * An already-paid or already-cancelled order can't be checked out
     * again -- 409, there's nothing sensible left to confirm.
     *
     * On success, hands a receipt built from the order's line items off to
     * the print-agent (C-8) for physical printing. A failed print never
     * rolls back the payment -- the money was already received -- but the
     * response's `print_status` tells the Cashier-facing frontend whether
     * the receipt actually printed, so it can prompt a manual reprint if
     * not.
     */
    public function checkout(Request $request, Order $order): JsonResponse
    {
        if (in_array($order->status, [OrderStatus::Paid, OrderStatus::Cancelled], true)) {
            return response()->json([
                'message' => "Order is already {$order->status->value}.",
            ], 409);
        }

        $data = $request->validate([
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
        ]);

        $order = $this->paymentConfirmation->confirm($order, PaymentMethod::from($data['payment_method']));
        $order->load(['table', 'items.menuItem']);

        $printed = $this->printAgent->print($order);

        return response()->json($order->toArray() + [
            'print_status' => $printed ? 'printed' : 'failed',
        ]);
    }

    /**
     * Cashier cancels an order, removing it from active orders (C-7).
     * Role-gated to Cashier, same as checkout above.
     *
     * A paid order can't be cancelled -- the money was already received --
     * and an already-cancelled order can't be cancelled again; both are
     * 409.
     */
    public function cancel(Order $order): JsonResponse
    {
        if (in_array($order->status, [OrderStatus::Paid, OrderStatus::Cancelled], true)) {
            return response()->json([
                'message' => "Order is already {$order->status->value}.",
            ], 409);
        }

        $order->update(['status' => OrderStatus::Cancelled]);

        $order->load(['table', 'items.menuItem']);

        return response()->json($order);
    }
}
