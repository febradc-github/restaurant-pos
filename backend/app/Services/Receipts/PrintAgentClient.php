<?php

namespace App\Services\Receipts;

use App\Enums\PaymentMethod;
use App\Models\Order;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Hands a paid order's receipt off to the print-agent (C-8) for physical
 * printing -- a thin HTTP client around the print-agent's standalone
 * `POST /print` endpoint. See AR-print-agent-polyglot.md.
 *
 * Deliberately separate from PaymentConfirmationService: a failed print
 * must never roll back a successful payment, so this class only ever
 * reports success or failure back to the caller -- it never throws, even
 * when the print-agent process itself is unreachable.
 */
class PrintAgentClient
{
    /**
     * Build the receipt payload and hand it to the print-agent.
     *
     * Returns true if the print-agent accepted the job (2xx), false
     * otherwise -- including a non-2xx response or the print-agent being
     * unreachable altogether.
     */
    public function print(Order $order): bool
    {
        try {
            $response = Http::post($this->url(), $this->payloadFor($order));
        } catch (ConnectionException $e) {
            Log::warning('Print agent unreachable.', [
                'order_id' => $order->id,
                'message' => $e->getMessage(),
            ]);

            return false;
        }

        if ($response->failed()) {
            Log::warning('Print agent rejected the receipt.', [
                'order_id' => $order->id,
                'status' => $response->status(),
                'error' => $response->json('error'),
            ]);
        }

        return $response->successful();
    }

    /**
     * The receipt payload the print-agent expects: restaurant name, each
     * line item's name/qty/price, the order total, and whether to open the
     * cash drawer (only meaningful for cash payments).
     *
     * @return array<string, mixed>
     */
    public function payloadFor(Order $order): array
    {
        $items = $order->items->map(fn ($item) => [
            'name' => $item->menuItem->name,
            'qty' => $item->quantity,
            'price' => (float) $item->menuItem->price,
        ])->all();

        $total = array_sum(array_map(
            fn (array $item) => $item['price'] * $item['qty'],
            $items,
        ));

        return [
            'restaurantName' => config('app.name'),
            'timestamp' => ($order->paid_at ?? now())->toIso8601String(),
            'items' => $items,
            'total' => $total,
            'openDrawer' => $order->payment_method === PaymentMethod::Cash,
        ];
    }

    /**
     * The print-agent's URL. Host is fixed -- it's a same-machine local
     * process (see AR-print-agent-polyglot.md) -- port is configurable via
     * PRINT_AGENT_PORT, defaulting to 4000.
     */
    protected function url(): string
    {
        return 'http://127.0.0.1:'.config('services.print_agent.port').'/print';
    }
}
