<?php

namespace Tests\Feature\Tables;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Table;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TableLayoutTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return $user->createToken('test-token')->plainTextToken;
    }

    private function validTablePayload(array $overrides = []): array
    {
        return array_merge([
            'label' => 'Table 1',
            'shape' => 'round',
            'capacity' => 4,
            'x' => 10,
            'y' => 20,
            'width' => 80,
            'height' => 80,
        ], $overrides);
    }

    public function test_get_tables_succeeds_with_no_authentication(): void
    {
        $response = $this->getJson('/api/tables');

        $response->assertOk()->assertJson([]);
    }

    public function test_owner_can_create_a_table(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/tables', $this->validTablePayload());

        $response->assertCreated()
            ->assertJsonPath('label', 'Table 1')
            ->assertJsonPath('shape', 'round')
            ->assertJsonPath('capacity', 4);

        $this->assertDatabaseHas('tables', ['label' => 'Table 1', 'shape' => 'round']);
    }

    public function test_owner_can_move_and_resize_a_table(): void
    {
        $owner = User::factory()->owner()->create();
        $table = Table::factory()->create(['x' => 0, 'y' => 0, 'width' => 50, 'height' => 50]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/tables/{$table->id}", [
                'x' => 123.5,
                'y' => 456.5,
                'width' => 200,
                'height' => 150,
            ]);

        $response->assertOk()
            ->assertJsonPath('x', 123.5)
            ->assertJsonPath('y', 456.5)
            ->assertJsonPath('width', 200)
            ->assertJsonPath('height', 150);

        $this->assertDatabaseHas('tables', ['id' => $table->id, 'x' => 123.5, 'y' => 456.5]);
    }

    public function test_owner_can_delete_a_table(): void
    {
        $owner = User::factory()->owner()->create();
        $table = Table::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->deleteJson("/api/tables/{$table->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('tables', ['id' => $table->id]);
    }

    public function test_cashier_is_rejected_from_creating_a_table(): void
    {
        $cashier = User::factory()->cashier()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->postJson('/api/tables', $this->validTablePayload());

        $response->assertForbidden();
        $this->assertDatabaseCount('tables', 0);
    }

    public function test_cashier_is_rejected_from_updating_a_table(): void
    {
        $cashier = User::factory()->cashier()->create();
        $table = Table::factory()->create(['x' => 0]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->patchJson("/api/tables/{$table->id}", ['x' => 999]);

        $response->assertForbidden();
        $this->assertDatabaseHas('tables', ['id' => $table->id, 'x' => 0]);
    }

    public function test_cashier_is_rejected_from_deleting_a_table(): void
    {
        $cashier = User::factory()->cashier()->create();
        $table = Table::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->deleteJson("/api/tables/{$table->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('tables', ['id' => $table->id]);
    }

    public function test_unauthenticated_request_is_rejected_from_creating_a_table(): void
    {
        $response = $this->postJson('/api/tables', $this->validTablePayload());

        $response->assertUnauthorized();
        $this->assertDatabaseCount('tables', 0);
    }

    public function test_unauthenticated_request_is_rejected_from_updating_a_table(): void
    {
        $table = Table::factory()->create(['x' => 0]);

        $response = $this->patchJson("/api/tables/{$table->id}", ['x' => 999]);

        $response->assertUnauthorized();
        $this->assertDatabaseHas('tables', ['id' => $table->id, 'x' => 0]);
    }

    public function test_unauthenticated_request_is_rejected_from_deleting_a_table(): void
    {
        $table = Table::factory()->create();

        $response = $this->deleteJson("/api/tables/{$table->id}");

        $response->assertUnauthorized();
        $this->assertDatabaseHas('tables', ['id' => $table->id]);
    }

    public function test_creating_a_table_with_an_invalid_shape_is_rejected(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/tables', $this->validTablePayload(['shape' => 'hexagon']));

        $response->assertUnprocessable()->assertJsonValidationErrors(['shape']);
        $this->assertDatabaseCount('tables', 0);
    }

    public function test_creating_a_table_with_missing_required_fields_is_rejected(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/tables', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['label', 'shape', 'capacity', 'x', 'y', 'width', 'height']);
    }

    public function test_the_layout_persists_and_can_be_fetched_via_get(): void
    {
        $owner = User::factory()->owner()->create();

        $create = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/tables', $this->validTablePayload(['label' => 'Patio 3']));

        $create->assertCreated();

        $response = $this->getJson('/api/tables');

        $response->assertOk()->assertJsonFragment(['label' => 'Patio 3']);
    }

    public function test_owner_can_create_a_table_with_a_zone(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/tables', $this->validTablePayload(['zone' => 'Patio']));

        $response->assertCreated()->assertJsonPath('zone', 'Patio');

        $this->assertDatabaseHas('tables', ['label' => 'Table 1', 'zone' => 'Patio']);
    }

    public function test_a_table_can_be_created_without_a_zone(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/tables', $this->validTablePayload());

        $response->assertCreated()->assertJsonPath('zone', null);
    }

    public function test_owner_can_update_a_tables_zone(): void
    {
        $owner = User::factory()->owner()->create();
        $table = Table::factory()->create(['zone' => 'Main Floor']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->patchJson("/api/tables/{$table->id}", ['zone' => 'Bar']);

        $response->assertOk()->assertJsonPath('zone', 'Bar');
        $this->assertDatabaseHas('tables', ['id' => $table->id, 'zone' => 'Bar']);
    }

    public function test_creating_a_table_with_a_non_string_zone_is_rejected(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->postJson('/api/tables', $this->validTablePayload(['zone' => ['not', 'a', 'string']]));

        $response->assertUnprocessable()->assertJsonValidationErrors(['zone']);
    }

    public function test_index_marks_a_table_occupied_when_it_has_a_pending_order(): void
    {
        $table = Table::factory()->create();
        Order::factory()->create(['table_id' => $table->id, 'status' => OrderStatus::Pending]);

        $response = $this->getJson('/api/tables');

        $response->assertOk()->assertJsonFragment(['id' => $table->id, 'is_occupied' => true]);
    }

    public function test_index_marks_a_table_occupied_when_it_has_a_ready_order(): void
    {
        $table = Table::factory()->create();
        Order::factory()->create(['table_id' => $table->id, 'status' => OrderStatus::Ready]);

        $response = $this->getJson('/api/tables');

        $response->assertOk()->assertJsonFragment(['id' => $table->id, 'is_occupied' => true]);
    }

    public function test_index_marks_a_table_available_when_its_only_orders_are_paid_or_cancelled(): void
    {
        $table = Table::factory()->create();
        Order::factory()->create(['table_id' => $table->id, 'status' => OrderStatus::Paid]);
        Order::factory()->create(['table_id' => $table->id, 'status' => OrderStatus::Cancelled]);

        $response = $this->getJson('/api/tables');

        $response->assertOk()->assertJsonFragment(['id' => $table->id, 'is_occupied' => false]);
    }

    public function test_index_marks_a_table_with_no_orders_available(): void
    {
        $table = Table::factory()->create();

        $response = $this->getJson('/api/tables');

        $response->assertOk()->assertJsonFragment(['id' => $table->id, 'is_occupied' => false]);
    }
}
