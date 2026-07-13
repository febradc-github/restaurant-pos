<?php

namespace Tests\Feature\Inventory;

use App\Models\InventoryItem;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

/**
 * Exercises InventoryItem::decrementStock() directly -- the reusable
 * decrement mechanism this ticket (C-5) builds for future order-placement
 * code (C-6) to call once an Order model exists. No Order model or
 * order-creation endpoint is built here; this only proves the decrement
 * mechanism and the auto-unavailable side effect it triggers.
 */
class InventoryDecrementTest extends TestCase
{
    use RefreshDatabase;

    public function test_decrementing_stock_reduces_it_by_the_given_quantity(): void
    {
        $inventoryItem = InventoryItem::factory()->create(['stock' => 10]);

        $inventoryItem->decrementStock(3);

        $this->assertSame(7, $inventoryItem->fresh()->stock);
    }

    public function test_decrementing_stock_to_exactly_zero_flips_linked_menu_item_unavailable(): void
    {
        $inventoryItem = InventoryItem::factory()->create(['stock' => 1]);
        $menuItem = MenuItem::factory()->create(['available' => true]);
        $menuItem->inventoryItems()->attach($inventoryItem->id, ['quantity_required' => 1]);

        $inventoryItem->decrementStock(1);

        $this->assertSame(0, $inventoryItem->fresh()->stock);
        $this->assertFalse($menuItem->fresh()->available);
    }

    public function test_decrementing_stock_to_above_zero_leaves_linked_menu_item_available(): void
    {
        $inventoryItem = InventoryItem::factory()->create(['stock' => 10]);
        $menuItem = MenuItem::factory()->create(['available' => true]);
        $menuItem->inventoryItems()->attach($inventoryItem->id, ['quantity_required' => 1]);

        $inventoryItem->decrementStock(3);

        $this->assertSame(7, $inventoryItem->fresh()->stock);
        $this->assertTrue($menuItem->fresh()->available);
    }

    public function test_decrementing_past_zero_clamps_stock_at_zero(): void
    {
        $inventoryItem = InventoryItem::factory()->create(['stock' => 2]);

        $inventoryItem->decrementStock(5);

        $this->assertSame(0, $inventoryItem->fresh()->stock);
    }

    public function test_decrementing_by_a_non_positive_quantity_throws(): void
    {
        $inventoryItem = InventoryItem::factory()->create(['stock' => 10]);

        $this->expectException(InvalidArgumentException::class);

        $inventoryItem->decrementStock(0);
    }

    public function test_menu_item_linked_to_multiple_inventory_items_is_unavailable_if_any_hits_zero(): void
    {
        $patty = InventoryItem::factory()->create(['stock' => 5]);
        $bun = InventoryItem::factory()->create(['stock' => 1]);
        $menuItem = MenuItem::factory()->create(['available' => true]);
        $menuItem->inventoryItems()->attach($patty->id, ['quantity_required' => 1]);
        $menuItem->inventoryItems()->attach($bun->id, ['quantity_required' => 1]);

        // Patty still has plenty of stock, but the bun runs out -- the menu
        // item should still flip unavailable since it needs both.
        $bun->decrementStock(1);

        $this->assertSame(5, $patty->fresh()->stock);
        $this->assertSame(0, $bun->fresh()->stock);
        $this->assertFalse($menuItem->fresh()->available);
    }

    public function test_menu_item_stays_available_while_all_linked_inventory_items_have_stock(): void
    {
        $patty = InventoryItem::factory()->create(['stock' => 5]);
        $bun = InventoryItem::factory()->create(['stock' => 5]);
        $menuItem = MenuItem::factory()->create(['available' => true]);
        $menuItem->inventoryItems()->attach($patty->id, ['quantity_required' => 1]);
        $menuItem->inventoryItems()->attach($bun->id, ['quantity_required' => 1]);

        $patty->decrementStock(1);
        $bun->decrementStock(1);

        $this->assertTrue($menuItem->fresh()->available);
    }

    public function test_setting_stock_to_zero_via_the_api_also_flips_linked_menu_item_unavailable(): void
    {
        $owner = User::factory()->owner()->create();
        $inventoryItem = InventoryItem::factory()->create(['stock' => 5]);
        $menuItem = MenuItem::factory()->create(['available' => true]);
        $menuItem->inventoryItems()->attach($inventoryItem->id, ['quantity_required' => 1]);

        $token = $owner->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/inventory-items/{$inventoryItem->id}", ['stock' => 0]);

        $response->assertOk();
        $this->assertFalse($menuItem->fresh()->available);
    }
}
