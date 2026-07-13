<?php

namespace Tests\Feature\Inventory;

use App\Models\InventoryItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryItemTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return $user->createToken('test-token')->plainTextToken;
    }

    private function validInventoryItemPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Beef Patty',
            'stock' => 50,
        ], $overrides);
    }

    public function test_get_inventory_items_succeeds_with_no_authentication(): void
    {
        $response = $this->getJson('/api/inventory-items');

        $response->assertOk()->assertJson([]);
    }

    public function test_owner_can_create_an_inventory_item(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/inventory-items', $this->validInventoryItemPayload());

        $response->assertCreated()
            ->assertJsonPath('name', 'Beef Patty')
            ->assertJsonPath('stock', 50);

        $this->assertDatabaseHas('inventory_items', ['name' => 'Beef Patty', 'stock' => 50]);
    }

    public function test_owner_can_adjust_an_inventory_items_stock(): void
    {
        $owner = User::factory()->owner()->create();
        $inventoryItem = InventoryItem::factory()->create(['stock' => 10]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/inventory-items/{$inventoryItem->id}", ['stock' => 25]);

        $response->assertOk()->assertJsonPath('stock', 25);

        $this->assertDatabaseHas('inventory_items', ['id' => $inventoryItem->id, 'stock' => 25]);
    }

    public function test_owner_can_rename_an_inventory_item(): void
    {
        $owner = User::factory()->owner()->create();
        $inventoryItem = InventoryItem::factory()->create(['name' => 'Buns']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/inventory-items/{$inventoryItem->id}", ['name' => 'Sesame Buns']);

        $response->assertOk()->assertJsonPath('name', 'Sesame Buns');

        $this->assertDatabaseHas('inventory_items', ['id' => $inventoryItem->id, 'name' => 'Sesame Buns']);
    }

    public function test_owner_can_delete_an_inventory_item(): void
    {
        $owner = User::factory()->owner()->create();
        $inventoryItem = InventoryItem::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->deleteJson("/api/inventory-items/{$inventoryItem->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('inventory_items', ['id' => $inventoryItem->id]);
    }

    public function test_cashier_is_rejected_from_creating_an_inventory_item(): void
    {
        $cashier = User::factory()->cashier()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->postJson('/api/inventory-items', $this->validInventoryItemPayload());

        $response->assertForbidden();
        $this->assertDatabaseCount('inventory_items', 0);
    }

    public function test_cashier_is_rejected_from_adjusting_stock(): void
    {
        $cashier = User::factory()->cashier()->create();
        $inventoryItem = InventoryItem::factory()->create(['stock' => 10]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->patchJson("/api/inventory-items/{$inventoryItem->id}", ['stock' => 25]);

        $response->assertForbidden();
        $this->assertDatabaseHas('inventory_items', ['id' => $inventoryItem->id, 'stock' => 10]);
    }

    public function test_cashier_is_rejected_from_deleting_an_inventory_item(): void
    {
        $cashier = User::factory()->cashier()->create();
        $inventoryItem = InventoryItem::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->deleteJson("/api/inventory-items/{$inventoryItem->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('inventory_items', ['id' => $inventoryItem->id]);
    }

    public function test_unauthenticated_request_is_rejected_from_creating_an_inventory_item(): void
    {
        $response = $this->postJson('/api/inventory-items', $this->validInventoryItemPayload());

        $response->assertUnauthorized();
        $this->assertDatabaseCount('inventory_items', 0);
    }

    public function test_unauthenticated_request_is_rejected_from_adjusting_stock(): void
    {
        $inventoryItem = InventoryItem::factory()->create(['stock' => 10]);

        $response = $this->patchJson("/api/inventory-items/{$inventoryItem->id}", ['stock' => 25]);

        $response->assertUnauthorized();
        $this->assertDatabaseHas('inventory_items', ['id' => $inventoryItem->id, 'stock' => 10]);
    }

    public function test_unauthenticated_request_is_rejected_from_deleting_an_inventory_item(): void
    {
        $inventoryItem = InventoryItem::factory()->create();

        $response = $this->deleteJson("/api/inventory-items/{$inventoryItem->id}");

        $response->assertUnauthorized();
        $this->assertDatabaseHas('inventory_items', ['id' => $inventoryItem->id]);
    }

    public function test_creating_an_inventory_item_with_negative_stock_is_rejected(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/inventory-items', $this->validInventoryItemPayload(['stock' => -5]));

        $response->assertUnprocessable()->assertJsonValidationErrors(['stock']);
        $this->assertDatabaseCount('inventory_items', 0);
    }

    public function test_adjusting_stock_to_a_negative_value_is_rejected(): void
    {
        $owner = User::factory()->owner()->create();
        $inventoryItem = InventoryItem::factory()->create(['stock' => 10]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/inventory-items/{$inventoryItem->id}", ['stock' => -1]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['stock']);
        $this->assertDatabaseHas('inventory_items', ['id' => $inventoryItem->id, 'stock' => 10]);
    }

    public function test_creating_an_inventory_item_with_a_missing_name_is_rejected(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/inventory-items', $this->validInventoryItemPayload(['name' => '']));

        $response->assertUnprocessable()->assertJsonValidationErrors(['name']);
        $this->assertDatabaseCount('inventory_items', 0);
    }

    public function test_a_new_inventory_item_is_immediately_visible_via_get(): void
    {
        $owner = User::factory()->owner()->create();

        $create = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/inventory-items', $this->validInventoryItemPayload(['name' => 'Lettuce']));

        $create->assertCreated();

        $response = $this->getJson('/api/inventory-items');

        $response->assertOk()->assertJsonFragment(['name' => 'Lettuce']);
    }
}
