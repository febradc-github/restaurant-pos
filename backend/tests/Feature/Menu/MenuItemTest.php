<?php

namespace Tests\Feature\Menu;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuItemTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return $user->createToken('test-token')->plainTextToken;
    }

    private function validMenuItemPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Cheeseburger',
            'price' => 9.99,
            'category_id' => Category::factory()->create()->id,
            'available' => true,
        ], $overrides);
    }

    public function test_get_menu_items_succeeds_with_no_authentication(): void
    {
        $response = $this->getJson('/api/menu-items');

        $response->assertOk()->assertJson([]);
    }

    public function test_owner_can_create_a_menu_item(): void
    {
        $owner = User::factory()->owner()->create();
        $category = Category::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/menu-items', $this->validMenuItemPayload(['category_id' => $category->id]));

        $response->assertCreated()
            ->assertJsonPath('name', 'Cheeseburger')
            ->assertJsonPath('price', '9.99')
            ->assertJsonPath('category_id', $category->id)
            ->assertJsonPath('available', true);

        $this->assertDatabaseHas('menu_items', ['name' => 'Cheeseburger', 'category_id' => $category->id]);
    }

    public function test_owner_can_update_a_menu_items_name_price_and_category(): void
    {
        $owner = User::factory()->owner()->create();
        $originalCategory = Category::factory()->create();
        $newCategory = Category::factory()->create();
        $menuItem = MenuItem::factory()->create([
            'name' => 'Fries',
            'price' => 3.50,
            'category_id' => $originalCategory->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/menu-items/{$menuItem->id}", [
                'name' => 'Curly Fries',
                'price' => 4.25,
                'category_id' => $newCategory->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('name', 'Curly Fries')
            ->assertJsonPath('price', '4.25')
            ->assertJsonPath('category_id', $newCategory->id);

        $this->assertDatabaseHas('menu_items', [
            'id' => $menuItem->id,
            'name' => 'Curly Fries',
            'category_id' => $newCategory->id,
        ]);
    }

    public function test_owner_can_toggle_a_menu_items_availability(): void
    {
        $owner = User::factory()->owner()->create();
        $menuItem = MenuItem::factory()->create(['available' => true]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/menu-items/{$menuItem->id}", ['available' => false]);

        $response->assertOk()->assertJsonPath('available', false);

        $this->assertDatabaseHas('menu_items', ['id' => $menuItem->id, 'available' => false]);
    }

    public function test_owner_can_delete_a_menu_item(): void
    {
        $owner = User::factory()->owner()->create();
        $menuItem = MenuItem::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->deleteJson("/api/menu-items/{$menuItem->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('menu_items', ['id' => $menuItem->id]);
    }

    public function test_cashier_is_rejected_from_creating_a_menu_item(): void
    {
        $cashier = User::factory()->cashier()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->postJson('/api/menu-items', $this->validMenuItemPayload());

        $response->assertForbidden();
        $this->assertDatabaseCount('menu_items', 0);
    }

    public function test_cashier_is_rejected_from_updating_a_menu_item(): void
    {
        $cashier = User::factory()->cashier()->create();
        $menuItem = MenuItem::factory()->create(['available' => true]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->patchJson("/api/menu-items/{$menuItem->id}", ['available' => false]);

        $response->assertForbidden();
        $this->assertDatabaseHas('menu_items', ['id' => $menuItem->id, 'available' => true]);
    }

    public function test_cashier_is_rejected_from_deleting_a_menu_item(): void
    {
        $cashier = User::factory()->cashier()->create();
        $menuItem = MenuItem::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->deleteJson("/api/menu-items/{$menuItem->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('menu_items', ['id' => $menuItem->id]);
    }

    public function test_unauthenticated_request_is_rejected_from_creating_a_menu_item(): void
    {
        $response = $this->postJson('/api/menu-items', $this->validMenuItemPayload());

        $response->assertUnauthorized();
        $this->assertDatabaseCount('menu_items', 0);
    }

    public function test_unauthenticated_request_is_rejected_from_updating_a_menu_item(): void
    {
        $menuItem = MenuItem::factory()->create(['available' => true]);

        $response = $this->patchJson("/api/menu-items/{$menuItem->id}", ['available' => false]);

        $response->assertUnauthorized();
        $this->assertDatabaseHas('menu_items', ['id' => $menuItem->id, 'available' => true]);
    }

    public function test_unauthenticated_request_is_rejected_from_deleting_a_menu_item(): void
    {
        $menuItem = MenuItem::factory()->create();

        $response = $this->deleteJson("/api/menu-items/{$menuItem->id}");

        $response->assertUnauthorized();
        $this->assertDatabaseHas('menu_items', ['id' => $menuItem->id]);
    }

    public function test_creating_a_menu_item_with_a_negative_price_is_rejected(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/menu-items', $this->validMenuItemPayload(['price' => -5]));

        $response->assertUnprocessable()->assertJsonValidationErrors(['price']);
        $this->assertDatabaseCount('menu_items', 0);
    }

    public function test_creating_a_menu_item_with_a_missing_name_is_rejected(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/menu-items', $this->validMenuItemPayload(['name' => '']));

        $response->assertUnprocessable()->assertJsonValidationErrors(['name']);
        $this->assertDatabaseCount('menu_items', 0);
    }

    public function test_creating_a_menu_item_with_a_nonexistent_category_is_rejected(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/menu-items', $this->validMenuItemPayload(['category_id' => 99999]));

        $response->assertUnprocessable()->assertJsonValidationErrors(['category_id']);
        $this->assertDatabaseCount('menu_items', 0);
    }

    public function test_menu_items_can_be_filtered_by_category(): void
    {
        $categoryA = Category::factory()->create();
        $categoryB = Category::factory()->create();
        MenuItem::factory()->create(['name' => 'In A', 'category_id' => $categoryA->id]);
        MenuItem::factory()->create(['name' => 'In B', 'category_id' => $categoryB->id]);

        $response = $this->getJson("/api/menu-items?category_id={$categoryA->id}");

        $response->assertOk()->assertJsonCount(1)->assertJsonFragment(['name' => 'In A']);
    }

    public function test_a_new_menu_item_is_immediately_visible_via_get(): void
    {
        $owner = User::factory()->owner()->create();

        $create = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/menu-items', $this->validMenuItemPayload(['name' => 'Milkshake']));

        $create->assertCreated();

        $response = $this->getJson('/api/menu-items');

        $response->assertOk()->assertJsonFragment(['name' => 'Milkshake']);
    }

    public function test_toggling_availability_is_immediately_visible_via_get(): void
    {
        $owner = User::factory()->owner()->create();
        $menuItem = MenuItem::factory()->create(['name' => 'Soup', 'available' => true]);

        $toggle = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/menu-items/{$menuItem->id}", ['available' => false]);

        $toggle->assertOk();

        $response = $this->getJson('/api/menu-items');

        $response->assertOk()->assertJsonFragment(['name' => 'Soup', 'available' => false]);
    }
}
