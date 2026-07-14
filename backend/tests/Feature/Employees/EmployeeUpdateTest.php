<?php

namespace Tests\Feature\Employees;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * PATCH /api/employees/{user} (C-21): Owner-only edit of an employee's role
 * and/or credential reset.
 */
class EmployeeUpdateTest extends TestCase
{
    use RefreshDatabase;

    private function ownerToken(): string
    {
        $owner = User::factory()->owner()->create();

        return $owner->createToken('test-token')->plainTextToken;
    }

    public function test_requires_authentication(): void
    {
        $cashier = User::factory()->cashier()->create();

        $response = $this->patchJson("/api/employees/{$cashier->id}", ['role' => 'server']);

        $response->assertUnauthorized();
    }

    public function test_non_owner_roles_are_forbidden(): void
    {
        $actor = User::factory()->cashier()->create();
        $target = User::factory()->server()->create();
        $token = $actor->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/employees/{$target->id}", ['role' => 'cashier']);

        $response->assertForbidden();
    }

    public function test_owner_changes_an_employees_role(): void
    {
        $server = User::factory()->server()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->patchJson("/api/employees/{$server->id}", ['role' => 'cashier']);

        $response->assertOk()->assertJsonPath('role', 'cashier');
        $this->assertDatabaseHas('users', ['id' => $server->id, 'role' => 'cashier']);
    }

    public function test_owner_resets_a_login_employees_password(): void
    {
        $cashier = User::factory()->cashier()->create(['password' => bcrypt('old-password')]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->patchJson("/api/employees/{$cashier->id}", ['password' => 'brand-new-password']);

        $response->assertOk();

        $fresh = $cashier->fresh();
        $this->assertTrue(Hash::check('brand-new-password', $fresh->password));
        $this->assertFalse(Hash::check('old-password', $fresh->password));
    }

    public function test_owner_resets_a_kitchen_employees_pin(): void
    {
        $cook = User::factory()->kitchen('111111')->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->patchJson("/api/employees/{$cook->id}", ['pin' => '222222']);

        $response->assertOk()->assertJsonPath('has_pin', true);
        $this->assertDatabaseHas('users', ['id' => $cook->id, 'pin' => '222222']);
    }

    public function test_new_pin_must_still_be_unique(): void
    {
        User::factory()->kitchen('333333')->create();
        $cook = User::factory()->kitchen('444444')->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->patchJson("/api/employees/{$cook->id}", ['pin' => '333333']);

        $response->assertUnprocessable()->assertJsonValidationErrors('pin');
        $this->assertDatabaseHas('users', ['id' => $cook->id, 'pin' => '444444']);
    }

    public function test_new_email_must_still_be_unique(): void
    {
        User::factory()->cashier()->create(['email' => 'taken@example.com']);
        $server = User::factory()->server()->create(['email' => 'server@example.com']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->patchJson("/api/employees/{$server->id}", ['email' => 'taken@example.com']);

        $response->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->assertDatabaseHas('users', ['id' => $server->id, 'email' => 'server@example.com']);
    }

    public function test_updating_own_email_to_the_same_value_is_allowed(): void
    {
        $server = User::factory()->server()->create(['email' => 'server@example.com']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->patchJson("/api/employees/{$server->id}", ['email' => 'server@example.com', 'name' => 'Renamed Server']);

        $response->assertOk();
    }
}
