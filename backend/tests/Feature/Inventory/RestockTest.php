<?php

namespace Tests\Feature\Inventory;

use App\Enums\OrderStatus;
use App\Models\InventoryItem;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * GET /api/inventory-items/restock and PATCH
 * /api/inventory-items/{inventoryItem}/threshold (C-25): per-ingredient
 * current stock, set threshold, a suggested threshold derived from the
 * trailing 30 days of Paid-order consumption, and the shortfall needed to
 * reach the set threshold. Owner-only, same role-gate pattern as C-24's
 * analytics endpoints -- and the same Paid-only, paid_at-dated convention.
 */
class RestockTest extends TestCase
{
    use RefreshDatabase;

    private function ownerToken(): string
    {
        $owner = User::factory()->owner()->create();

        return $owner->createToken('test-token')->plainTextToken;
    }

    /**
     * A Paid order for the given menu item/quantity, paid at the given
     * timestamp.
     */
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

    public function test_restock_report_requires_authentication(): void
    {
        $response = $this->getJson('/api/inventory-items/restock');

        $response->assertUnauthorized();
    }

    public function test_restock_report_rejects_non_owner_roles(): void
    {
        $cashier = User::factory()->cashier()->create();
        $token = $cashier->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/inventory-items/restock');

        $response->assertForbidden();
    }

    public function test_a_new_inventory_item_defaults_its_threshold_to_zero(): void
    {
        $inventoryItem = InventoryItem::factory()->create();

        $this->assertSame(0, $inventoryItem->fresh()->threshold);
        $this->assertDatabaseHas('inventory_items', ['id' => $inventoryItem->id, 'threshold' => 0]);
    }

    public function test_an_ingredient_with_no_paid_order_history_gets_a_zero_suggested_threshold(): void
    {
        $inventoryItem = InventoryItem::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/inventory-items/restock');

        $response->assertOk();
        $row = collect($response->json())->firstWhere('id', $inventoryItem->id);

        $this->assertSame(0, $row['suggested_threshold']);
    }

    public function test_suggested_threshold_only_counts_paid_order_consumption_inside_the_trailing_30_day_window(): void
    {
        $inventoryItem = InventoryItem::factory()->create();
        $menuItem = MenuItem::factory()->create();
        $menuItem->inventoryItems()->attach($inventoryItem->id, ['quantity_required' => 2]);

        // Inside the window (today minus 10 days): 3 orders of 1 each -- 2 units consumed per order.
        $this->paidOrder(now()->subDays(10)->toDateTimeString(), $menuItem, 1);
        $this->paidOrder(now()->subDays(5)->toDateTimeString(), $menuItem, 1);
        $this->paidOrder(now()->subDays(1)->toDateTimeString(), $menuItem, 1);

        // Outside the window (31+ days ago) -- must not contribute.
        $this->paidOrder(now()->subDays(31)->toDateTimeString(), $menuItem, 10);
        $this->paidOrder(now()->subDays(90)->toDateTimeString(), $menuItem, 10);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/inventory-items/restock');

        $response->assertOk();
        $row = collect($response->json())->firstWhere('id', $inventoryItem->id);

        // In-window consumption: 3 orders * 1 quantity * 2 quantity_required = 6 units over 30 days.
        // Average daily usage = 6 / 30 = 0.2, rounded up to 1.
        $this->assertSame(1, $row['suggested_threshold']);
    }

    public function test_non_paid_orders_within_the_window_do_not_contribute_to_the_suggested_threshold(): void
    {
        $inventoryItem = InventoryItem::factory()->create();
        $menuItem = MenuItem::factory()->create();
        $menuItem->inventoryItems()->attach($inventoryItem->id, ['quantity_required' => 1]);

        $pendingOrder = Order::factory()->create(['status' => OrderStatus::Pending]);
        OrderItem::factory()->create(['order_id' => $pendingOrder->id, 'menu_item_id' => $menuItem->id, 'quantity' => 30]);

        $readyOrder = Order::factory()->create(['status' => OrderStatus::Ready]);
        OrderItem::factory()->create(['order_id' => $readyOrder->id, 'menu_item_id' => $menuItem->id, 'quantity' => 30]);

        $cancelledOrder = Order::factory()->create(['status' => OrderStatus::Cancelled, 'paid_at' => null]);
        OrderItem::factory()->create(['order_id' => $cancelledOrder->id, 'menu_item_id' => $menuItem->id, 'quantity' => 30]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/inventory-items/restock');

        $response->assertOk();
        $row = collect($response->json())->firstWhere('id', $inventoryItem->id);

        $this->assertSame(0, $row['suggested_threshold']);
    }

    public function test_shortfall_is_zero_when_stock_is_above_threshold(): void
    {
        $inventoryItem = InventoryItem::factory()->create(['stock' => 10, 'threshold' => 5]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/inventory-items/restock');

        $response->assertOk();
        $row = collect($response->json())->firstWhere('id', $inventoryItem->id);

        $this->assertSame(10, $row['stock']);
        $this->assertSame(5, $row['threshold']);
        $this->assertSame(0, $row['shortfall']);
    }

    public function test_shortfall_is_zero_when_stock_exactly_equals_threshold(): void
    {
        $inventoryItem = InventoryItem::factory()->create(['stock' => 5, 'threshold' => 5]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/inventory-items/restock');

        $response->assertOk();
        $row = collect($response->json())->firstWhere('id', $inventoryItem->id);

        $this->assertSame(0, $row['shortfall']);
    }

    public function test_shortfall_is_the_positive_difference_when_stock_is_below_threshold(): void
    {
        $inventoryItem = InventoryItem::factory()->create(['stock' => 2, 'threshold' => 15]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/inventory-items/restock');

        $response->assertOk();
        $row = collect($response->json())->firstWhere('id', $inventoryItem->id);

        $this->assertSame(13, $row['shortfall']);
    }

    public function test_owner_can_override_an_inventory_items_threshold(): void
    {
        $inventoryItem = InventoryItem::factory()->create(['threshold' => 5]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->patchJson("/api/inventory-items/{$inventoryItem->id}/threshold", ['threshold' => 40]);

        $response->assertOk()->assertJsonPath('threshold', 40);

        $this->assertDatabaseHas('inventory_items', ['id' => $inventoryItem->id, 'threshold' => 40]);
    }

    public function test_cashier_is_rejected_from_overriding_a_threshold(): void
    {
        $cashier = User::factory()->cashier()->create();
        $inventoryItem = InventoryItem::factory()->create(['threshold' => 5]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->patchJson("/api/inventory-items/{$inventoryItem->id}/threshold", ['threshold' => 40]);

        $response->assertForbidden();
        $this->assertDatabaseHas('inventory_items', ['id' => $inventoryItem->id, 'threshold' => 5]);
    }

    public function test_unauthenticated_request_is_rejected_from_overriding_a_threshold(): void
    {
        $inventoryItem = InventoryItem::factory()->create(['threshold' => 5]);

        $response = $this->patchJson("/api/inventory-items/{$inventoryItem->id}/threshold", ['threshold' => 40]);

        $response->assertUnauthorized();
        $this->assertDatabaseHas('inventory_items', ['id' => $inventoryItem->id, 'threshold' => 5]);
    }

    public function test_overriding_a_threshold_with_a_negative_value_is_rejected(): void
    {
        $inventoryItem = InventoryItem::factory()->create(['threshold' => 5]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->patchJson("/api/inventory-items/{$inventoryItem->id}/threshold", ['threshold' => -1]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['threshold']);
        $this->assertDatabaseHas('inventory_items', ['id' => $inventoryItem->id, 'threshold' => 5]);
    }

    private function tokenFor(User $user): string
    {
        return $user->createToken('test-token')->plainTextToken;
    }
}
