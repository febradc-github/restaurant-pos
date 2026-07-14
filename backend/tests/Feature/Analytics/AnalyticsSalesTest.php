<?php

namespace Tests\Feature\Analytics;

use App\Enums\OrderStatus;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * GET /api/analytics/sales (C-24): revenue grouped by day for Paid orders
 * within a date range, dated by paid_at. Owner-only, same role-gate pattern
 * as the other Owner-only analytics-adjacent endpoints (/time-entries).
 */
class AnalyticsSalesTest extends TestCase
{
    use RefreshDatabase;

    private function ownerToken(): string
    {
        $owner = User::factory()->owner()->create();

        return $owner->createToken('test-token')->plainTextToken;
    }

    private function paidOrder(string $paidAt, MenuItem $menuItem, int $quantity): Order
    {
        $order = Order::factory()->create([
            'status' => OrderStatus::Paid,
            'paid_at' => $paidAt,
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'menu_item_id' => $menuItem->id,
            'quantity' => $quantity,
        ]);

        return $order;
    }

    public function test_requires_authentication(): void
    {
        $response = $this->getJson('/api/analytics/sales');

        $response->assertUnauthorized();
    }

    public function test_non_owner_roles_are_forbidden(): void
    {
        $cashier = User::factory()->cashier()->create();
        $token = $cashier->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/analytics/sales');

        $response->assertForbidden();
    }

    public function test_only_paid_orders_contribute_revenue(): void
    {
        $menuItem = MenuItem::factory()->create(['price' => '10.00']);

        $paid = $this->paidOrder('2026-07-10 12:00:00', $menuItem, 1);

        // Pending, ready, and cancelled orders must not contribute.
        $pendingOrder = Order::factory()->create(['status' => OrderStatus::Pending]);
        OrderItem::factory()->create(['order_id' => $pendingOrder->id, 'menu_item_id' => $menuItem->id, 'quantity' => 5]);

        $readyOrder = Order::factory()->create(['status' => OrderStatus::Ready]);
        OrderItem::factory()->create(['order_id' => $readyOrder->id, 'menu_item_id' => $menuItem->id, 'quantity' => 5]);

        $cancelledOrder = Order::factory()->create(['status' => OrderStatus::Cancelled, 'paid_at' => null]);
        OrderItem::factory()->create(['order_id' => $cancelledOrder->id, 'menu_item_id' => $menuItem->id, 'quantity' => 5]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/analytics/sales');

        $response->assertOk();
        $data = $response->json();

        $this->assertCount(1, $data);
        $this->assertSame('2026-07-10', $data[0]['date']);
        $this->assertSame('10.00', $data[0]['revenue']);
    }

    public function test_groups_revenue_by_day_across_multiple_paid_orders(): void
    {
        $menuItem = MenuItem::factory()->create(['price' => '15.50']);

        // Two orders on the same day: 15.50 + 2*15.50 = 46.50.
        $this->paidOrder('2026-07-10 09:00:00', $menuItem, 1);
        $this->paidOrder('2026-07-10 18:30:00', $menuItem, 2);

        // A different day: 15.50.
        $this->paidOrder('2026-07-11 12:00:00', $menuItem, 1);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/analytics/sales');

        $response->assertOk();
        $data = collect($response->json())->keyBy('date');

        $this->assertSame('46.50', $data['2026-07-10']['revenue']);
        $this->assertSame('15.50', $data['2026-07-11']['revenue']);
    }

    public function test_filters_by_paid_at_date_range(): void
    {
        $menuItem = MenuItem::factory()->create(['price' => '5.00']);

        $inRange = $this->paidOrder('2026-07-10 09:00:00', $menuItem, 1);
        $this->paidOrder('2026-06-01 09:00:00', $menuItem, 1);
        $this->paidOrder('2026-08-01 09:00:00', $menuItem, 1);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/analytics/sales?from=2026-07-01&to=2026-07-31');

        $response->assertOk();
        $data = $response->json();

        $this->assertCount(1, $data);
        $this->assertSame('2026-07-10', $data[0]['date']);
        $this->assertNotNull($inRange);
    }

    public function test_a_to_bound_on_the_same_day_as_a_paid_order_still_includes_it(): void
    {
        $menuItem = MenuItem::factory()->create(['price' => '5.00']);

        $this->paidOrder('2026-07-15 18:00:00', $menuItem, 1);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/analytics/sales?to=2026-07-15');

        $response->assertOk();
        $data = $response->json();

        $this->assertCount(1, $data);
        $this->assertSame('2026-07-15', $data[0]['date']);
    }
}
