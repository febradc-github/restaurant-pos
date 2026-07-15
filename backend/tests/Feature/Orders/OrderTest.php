<?php

namespace Tests\Feature\Orders;

use App\Enums\OrderStatus;
use App\Events\OrderPlaced;
use App\Events\OrderStatusUpdated;
use App\Models\InventoryItem;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

/**
 * Exercises order taking (Server, no login) and the Kitchen Display's
 * ready/done action and reconnect-catch-up fetch (Kitchen, no login) --
 * the backend half of C-6.
 */
class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_server_can_place_an_order_without_authentication_and_it_persists_with_line_items(): void
    {
        $table = Table::factory()->create();
        $burger = MenuItem::factory()->create(['name' => 'Cheeseburger']);
        $fries = MenuItem::factory()->create(['name' => 'Fries']);

        $response = $this->postJson('/api/orders', [
            'table_id' => $table->id,
            'items' => [
                ['menu_item_id' => $burger->id, 'quantity' => 2],
                ['menu_item_id' => $fries->id, 'quantity' => 1],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('table_id', $table->id)
            ->assertJsonPath('status', 'pending');

        $this->assertDatabaseHas('orders', [
            'table_id' => $table->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseHas('order_items', [
            'menu_item_id' => $burger->id,
            'quantity' => 2,
        ]);
        $this->assertDatabaseHas('order_items', [
            'menu_item_id' => $fries->id,
            'quantity' => 1,
        ]);
    }

    public function test_server_can_attach_a_kitchen_note_to_a_line_item_and_it_is_persisted_and_returned(): void
    {
        $table = Table::factory()->create();
        $burger = MenuItem::factory()->create(['name' => 'Cheeseburger']);

        $response = $this->postJson('/api/orders', [
            'table_id' => $table->id,
            'items' => [
                ['menu_item_id' => $burger->id, 'quantity' => 1, 'notes' => 'No onions, please'],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('items.0.notes', 'No onions, please');

        $this->assertDatabaseHas('order_items', [
            'menu_item_id' => $burger->id,
            'notes' => 'No onions, please',
        ]);
    }

    public function test_a_line_item_with_no_note_persists_a_null_notes_value(): void
    {
        $table = Table::factory()->create();
        $menuItem = MenuItem::factory()->create();

        $response = $this->postJson('/api/orders', [
            'table_id' => $table->id,
            'items' => [
                ['menu_item_id' => $menuItem->id, 'quantity' => 1],
            ],
        ]);

        $response->assertCreated()->assertJsonPath('items.0.notes', null);
    }

    public function test_a_kitchen_note_over_the_max_length_is_rejected(): void
    {
        $table = Table::factory()->create();
        $menuItem = MenuItem::factory()->create();

        $response = $this->postJson('/api/orders', [
            'table_id' => $table->id,
            'items' => [
                ['menu_item_id' => $menuItem->id, 'quantity' => 1, 'notes' => str_repeat('a', 501)],
            ],
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['items.0.notes']);
    }

    public function test_placing_an_order_fires_the_order_placed_broadcast_event(): void
    {
        Event::fake([OrderPlaced::class]);

        $table = Table::factory()->create();
        $menuItem = MenuItem::factory()->create();

        $response = $this->postJson('/api/orders', [
            'table_id' => $table->id,
            'items' => [
                ['menu_item_id' => $menuItem->id, 'quantity' => 1],
            ],
        ]);

        $response->assertCreated();

        Event::assertDispatched(OrderPlaced::class, function (OrderPlaced $event) use ($table) {
            return $event->order->table_id === $table->id
                && $event->order->items->count() === 1;
        });
    }

    public function test_placing_an_order_decrements_linked_inventory_stock_and_flips_menu_item_unavailable_at_zero(): void
    {
        $table = Table::factory()->create();
        $bun = InventoryItem::factory()->create(['stock' => 1]);
        $menuItem = MenuItem::factory()->create(['available' => true]);
        $menuItem->inventoryItems()->attach($bun->id, ['quantity_required' => 1]);

        $response = $this->postJson('/api/orders', [
            'table_id' => $table->id,
            'items' => [
                ['menu_item_id' => $menuItem->id, 'quantity' => 1],
            ],
        ]);

        $response->assertCreated();
        $this->assertSame(0, $bun->fresh()->stock);
        $this->assertFalse($menuItem->fresh()->available);
    }

    public function test_placing_an_order_decrements_stock_by_quantity_required_times_ordered_quantity(): void
    {
        $table = Table::factory()->create();
        $patty = InventoryItem::factory()->create(['stock' => 10]);
        $menuItem = MenuItem::factory()->create();
        $menuItem->inventoryItems()->attach($patty->id, ['quantity_required' => 2]);

        $response = $this->postJson('/api/orders', [
            'table_id' => $table->id,
            'items' => [
                ['menu_item_id' => $menuItem->id, 'quantity' => 3],
            ],
        ]);

        $response->assertCreated();
        $this->assertSame(4, $patty->fresh()->stock);
    }

    public function test_kitchen_can_mark_an_order_ready_without_authentication(): void
    {
        $order = Order::factory()->create(['status' => OrderStatus::Pending]);

        $response = $this->patchJson("/api/orders/{$order->id}/ready");

        $response->assertOk()->assertJsonPath('status', 'ready');
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'ready']);
    }

    public function test_marking_an_order_ready_fires_the_order_status_updated_broadcast_event(): void
    {
        Event::fake([OrderStatusUpdated::class]);

        $order = Order::factory()->create(['status' => OrderStatus::Pending]);

        $response = $this->patchJson("/api/orders/{$order->id}/ready");

        $response->assertOk();

        Event::assertDispatched(OrderStatusUpdated::class, function (OrderStatusUpdated $event) use ($order) {
            return $event->order->id === $order->id
                && $event->order->status === OrderStatus::Ready;
        });
    }

    public function test_get_orders_filtered_by_pending_status_excludes_ready_orders(): void
    {
        $pending = Order::factory()->create(['status' => OrderStatus::Pending]);
        $ready = Order::factory()->create(['status' => OrderStatus::Pending]);

        $this->patchJson("/api/orders/{$ready->id}/ready")->assertOk();

        $response = $this->getJson('/api/orders?status=pending');

        $response->assertOk();
        $ids = collect($response->json())->pluck('id');

        $this->assertTrue($ids->contains($pending->id));
        $this->assertFalse($ids->contains($ready->id));
    }

    public function test_creating_an_order_with_an_invalid_table_id_is_rejected(): void
    {
        $menuItem = MenuItem::factory()->create();

        $response = $this->postJson('/api/orders', [
            'table_id' => 999999,
            'items' => [
                ['menu_item_id' => $menuItem->id, 'quantity' => 1],
            ],
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['table_id']);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_creating_an_order_with_an_empty_items_array_is_rejected(): void
    {
        $table = Table::factory()->create();

        $response = $this->postJson('/api/orders', [
            'table_id' => $table->id,
            'items' => [],
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['items']);
        $this->assertDatabaseCount('orders', 0);
    }
}
