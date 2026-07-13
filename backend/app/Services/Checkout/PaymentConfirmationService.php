<?php

namespace App\Services\Checkout;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Models\Order;

/**
 * Confirms payment for an order and marks it paid.
 *
 * Kept as its own unit per ADR-005: v1 confirms payment manually (the
 * Cashier attests that cash, a QR Ph scan, or a GCash transfer was
 * received), rather than integrating a live payment gateway. When that
 * integration happens, it should only need to change what happens inside
 * this class -- not the surrounding checkout flow (route, receipt
 * printing, response shape).
 */
class PaymentConfirmationService
{
    /**
     * Record the given payment method against the order and mark it paid.
     */
    public function confirm(Order $order, PaymentMethod $method): Order
    {
        $order->update([
            'payment_method' => $method,
            'paid_at' => now(),
            'status' => OrderStatus::Paid,
        ]);

        return $order;
    }
}
