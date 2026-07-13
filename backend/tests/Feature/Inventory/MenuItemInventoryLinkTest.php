<?php

namespace Tests\Feature\Inventory;

use App\Models\InventoryItem;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuItemInventoryLinkTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return $user->createToken('test-token')->plainTextToken;
    }

    public function test_owner_can_link_a_menu_item_to_an_inventory_item(): void
    {
        $owner = User::factory()->owner()->create();
        $menuItem = MenuItem::factory()->create();
        $inventoryItem = InventoryItem::factory()->create(['stock' => 20]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson("/api/menu-items/{$menuItem->id}/inventory-items", [
                'inventory_item_id' => $inventoryItem->id,
                'quantity_required' => 2,
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('menu_item_inventory_item', [
            'menu_item_id' => $menuItem->id,
            'inventory_item_id' => $inventoryItem->id,
            'quantity_required' => 2,
        ]);
    }

    public function test_linking_defaults_quantity_required_to_one(): void
    {
        $owner = User::factory()->owner()->create();
        $menuItem = MenuItem::factory()->create();
        $inventoryItem = InventoryItem::factory()->create(['stock' => 20]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson("/api/menu-items/{$menuItem->id}/inventory-items", [
                'inventory_item_id' => $inventoryItem->id,
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('menu_item_inventory_item', [
            'menu_item_id' => $menuItem->id,
            'inventory_item_id' => $inventoryItem->id,
            'quantity_required' => 1,
        ]);
    }

    public function test_owner_can_unlink_a_menu_item_from_an_inventory_item(): void
    {
        $owner = User::factory()->owner()->create();
        $menuItem = MenuItem::factory()->create();
        $inventoryItem = InventoryItem::factory()->create(['stock' => 20]);
        $menuItem->inventoryItems()->attach($inventoryItem->id, ['quantity_required' => 1]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->deleteJson("/api/menu-items/{$menuItem->id}/inventory-items/{$inventoryItem->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('menu_item_inventory_item', [
            'menu_item_id' => $menuItem->id,
            'inventory_item_id' => $inventoryItem->id,
        ]);
    }

    public function test_cashier_is_rejected_from_linking_a_menu_item_to_an_inventory_item(): void
    {
        $cashier = User::factory()->cashier()->create();
        $menuItem = MenuItem::factory()->create();
        $inventoryItem = InventoryItem::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->postJson("/api/menu-items/{$menuItem->id}/inventory-items", [
                'inventory_item_id' => $inventoryItem->id,
            ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('menu_item_inventory_item', 0);
    }

    public function test_unauthenticated_request_is_rejected_from_linking_a_menu_item(): void
    {
        $menuItem = MenuItem::factory()->create();
        $inventoryItem = InventoryItem::factory()->create();

        $response = $this->postJson("/api/menu-items/{$menuItem->id}/inventory-items", [
            'inventory_item_id' => $inventoryItem->id,
        ]);

        $response->assertUnauthorized();
        $this->assertDatabaseCount('menu_item_inventory_item', 0);
    }

    public function test_cashier_is_rejected_from_unlinking_a_menu_item(): void
    {
        $cashier = User::factory()->cashier()->create();
        $menuItem = MenuItem::factory()->create();
        $inventoryItem = InventoryItem::factory()->create();
        $menuItem->inventoryItems()->attach($inventoryItem->id, ['quantity_required' => 1]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->deleteJson("/api/menu-items/{$menuItem->id}/inventory-items/{$inventoryItem->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('menu_item_inventory_item', [
            'menu_item_id' => $menuItem->id,
            'inventory_item_id' => $inventoryItem->id,
        ]);
    }

    public function test_linking_to_a_nonexistent_inventory_item_is_rejected(): void
    {
        $owner = User::factory()->owner()->create();
        $menuItem = MenuItem::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson("/api/menu-items/{$menuItem->id}/inventory-items", [
                'inventory_item_id' => 99999,
            ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['inventory_item_id']);
    }
}
