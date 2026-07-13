<?php

namespace Tests\Feature\Menu;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return $user->createToken('test-token')->plainTextToken;
    }

    public function test_get_categories_succeeds_with_no_authentication(): void
    {
        $response = $this->getJson('/api/categories');

        $response->assertOk()->assertJson([]);
    }

    public function test_owner_can_create_a_category(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/categories', ['name' => 'Appetizers']);

        $response->assertCreated()->assertJsonPath('name', 'Appetizers');

        $this->assertDatabaseHas('categories', ['name' => 'Appetizers']);
    }

    public function test_owner_can_update_a_category(): void
    {
        $owner = User::factory()->owner()->create();
        $category = Category::factory()->create(['name' => 'Drinks']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/categories/{$category->id}", ['name' => 'Beverages']);

        $response->assertOk()->assertJsonPath('name', 'Beverages');

        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'Beverages']);
    }

    public function test_owner_can_delete_an_empty_category(): void
    {
        $owner = User::factory()->owner()->create();
        $category = Category::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->deleteJson("/api/categories/{$category->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_owner_cannot_delete_a_category_that_still_has_menu_items(): void
    {
        $owner = User::factory()->owner()->create();
        $category = Category::factory()->create();
        MenuItem::factory()->create(['category_id' => $category->id]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(409);

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_cashier_is_rejected_from_creating_a_category(): void
    {
        $cashier = User::factory()->cashier()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->postJson('/api/categories', ['name' => 'Appetizers']);

        $response->assertForbidden();
        $this->assertDatabaseCount('categories', 0);
    }

    public function test_cashier_is_rejected_from_updating_a_category(): void
    {
        $cashier = User::factory()->cashier()->create();
        $category = Category::factory()->create(['name' => 'Drinks']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->patchJson("/api/categories/{$category->id}", ['name' => 'Beverages']);

        $response->assertForbidden();
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'Drinks']);
    }

    public function test_cashier_is_rejected_from_deleting_a_category(): void
    {
        $cashier = User::factory()->cashier()->create();
        $category = Category::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->deleteJson("/api/categories/{$category->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_unauthenticated_request_is_rejected_from_creating_a_category(): void
    {
        $response = $this->postJson('/api/categories', ['name' => 'Appetizers']);

        $response->assertUnauthorized();
        $this->assertDatabaseCount('categories', 0);
    }

    public function test_unauthenticated_request_is_rejected_from_updating_a_category(): void
    {
        $category = Category::factory()->create(['name' => 'Drinks']);

        $response = $this->patchJson("/api/categories/{$category->id}", ['name' => 'Beverages']);

        $response->assertUnauthorized();
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'Drinks']);
    }

    public function test_unauthenticated_request_is_rejected_from_deleting_a_category(): void
    {
        $category = Category::factory()->create();

        $response = $this->deleteJson("/api/categories/{$category->id}");

        $response->assertUnauthorized();
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_creating_a_category_with_missing_name_is_rejected(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/categories', []);

        $response->assertUnprocessable()->assertJsonValidationErrors(['name']);
        $this->assertDatabaseCount('categories', 0);
    }

    public function test_a_new_category_is_immediately_visible_via_get(): void
    {
        $owner = User::factory()->owner()->create();

        $create = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/categories', ['name' => 'Desserts']);

        $create->assertCreated();

        $response = $this->getJson('/api/categories');

        $response->assertOk()->assertJsonFragment(['name' => 'Desserts']);
    }
}
