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
 * GET /api/analytics/menu-items (C-24): menu items ranked by quantity sold
 * and revenue generated, across Paid orders' line items within a date
 * range. Owner-only, same role-gate pattern as /api/analytics/sales.
 */
class AnalyticsMenuItemsTest extends TestCase
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
        $response = $this->getJson('/api/analytics/menu-items');

        $response->assertUnauthorized();
    }

    public function test_non_owner_roles_are_forbidden(): void
    {
        $cashier = User::factory()->cashier()->create();
        $token = $cashier->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/analytics/menu-items');

        $response->assertForbidden();
    }

    public function test_only_paid_orders_contribute_to_the_ranking(): void
    {
        $menuItem = MenuItem::factory()->create(['name' => 'Burger', 'price' => '10.00']);

        $this->paidOrder('2026-07-10 12:00:00', $menuItem, 2);

        $pendingOrder = Order::factory()->create(['status' => OrderStatus::Pending]);
        OrderItem::factory()->create(['order_id' => $pendingOrder->id, 'menu_item_id' => $menuItem->id, 'quantity' => 50]);

        $readyOrder = Order::factory()->create(['status' => OrderStatus::Ready]);
        OrderItem::factory()->create(['order_id' => $readyOrder->id, 'menu_item_id' => $menuItem->id, 'quantity' => 50]);

        $cancelledOrder = Order::factory()->create(['status' => OrderStatus::Cancelled, 'paid_at' => null]);
        OrderItem::factory()->create(['order_id' => $cancelledOrder->id, 'menu_item_id' => $menuItem->id, 'quantity' => 50]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/analytics/menu-items');

        $response->assertOk();
        $data = $response->json();

        $this->assertCount(1, $data);
        $this->assertSame($menuItem->id, $data[0]['menu_item_id']);
        $this->assertSame(2, $data[0]['quantity_sold']);
        $this->assertSame('20.00', $data[0]['revenue']);
    }

    public function test_ranks_menu_items_by_revenue_descending_with_correct_quantity_and_revenue(): void
    {
        $burger = MenuItem::factory()->create(['name' => 'Burger', 'price' => '10.00']);
        $fries = MenuItem::factory()->create(['name' => 'Fries', 'price' => '3.00']);

        // Burger: 2 orders of qty 1 and 2 -> qty 3, revenue 30.00.
        $this->paidOrder('2026-07-10 09:00:00', $burger, 1);
        $this->paidOrder('2026-07-11 09:00:00', $burger, 2);

        // Fries: 10 units total across 2 orders -> qty 10, revenue 30.00.
        $this->paidOrder('2026-07-10 09:30:00', $fries, 4);
        $this->paidOrder('2026-07-11 09:30:00', $fries, 6);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/analytics/menu-items');

        $response->assertOk();
        $data = collect($response->json())->keyBy('menu_item_id');

        $this->assertSame(3, $data[$burger->id]['quantity_sold']);
        $this->assertSame('30.00', $data[$burger->id]['revenue']);

        $this->assertSame(10, $data[$fries->id]['quantity_sold']);
        $this->assertSame('30.00', $data[$fries->id]['revenue']);
    }

    public function test_filters_by_paid_at_date_range(): void
    {
        $menuItem = MenuItem::factory()->create(['name' => 'Burger', 'price' => '10.00']);

        $this->paidOrder('2026-07-10 09:00:00', $menuItem, 1);
        $this->paidOrder('2026-06-01 09:00:00', $menuItem, 5);
        $this->paidOrder('2026-08-01 09:00:00', $menuItem, 5);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/analytics/menu-items?from=2026-07-01&to=2026-07-31');

        $response->assertOk();
        $data = $response->json();

        $this->assertCount(1, $data);
        $this->assertSame(1, $data[0]['quantity_sold']);
    }

    public function test_a_to_bound_on_the_same_day_as_a_paid_order_still_includes_it(): void
    {
        $menuItem = MenuItem::factory()->create(['name' => 'Burger', 'price' => '10.00']);

        $this->paidOrder('2026-07-15 18:00:00', $menuItem, 1);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/analytics/menu-items?to=2026-07-15');

        $response->assertOk();
        $data = $response->json();

        $this->assertCount(1, $data);
        $this->assertSame($menuItem->id, $data[0]['menu_item_id']);
    }
}
