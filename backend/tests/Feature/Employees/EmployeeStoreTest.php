<?php

namespace Tests\Feature\Employees;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * POST /api/employees (C-21): Owner-only creation of a new employee. Owner,
 * Cashier, and Server get an email + password (login roles); Kitchen gets a
 * unique 6-digit PIN instead. Every new employee starts active.
 */
class EmployeeStoreTest extends TestCase
{
    use RefreshDatabase;

    private function ownerToken(): string
    {
        $owner = User::factory()->owner()->create();

        return $owner->createToken('test-token')->plainTextToken;
    }

    public function test_new_user_defaults_to_active(): void
    {
        $user = User::factory()->owner()->create();

        $this->assertTrue($user->fresh()->active);
    }

    public function test_requires_authentication(): void
    {
        $response = $this->postJson('/api/employees', [
            'name' => 'New Cashier',
            'role' => 'cashier',
            'email' => 'newcashier@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertUnauthorized();
    }

    public function test_non_owner_roles_are_forbidden(): void
    {
        $cashier = User::factory()->cashier()->create();
        $token = $cashier->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/employees', [
                'name' => 'New Cashier',
                'role' => 'cashier',
                'email' => 'newcashier@example.com',
                'password' => 'secret-password',
            ]);

        $response->assertForbidden();
    }

    public function test_owner_creates_a_cashier_with_email_and_password(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->postJson('/api/employees', [
                'name' => 'New Cashier',
                'role' => 'cashier',
                'email' => 'newcashier@example.com',
                'password' => 'secret-password',
            ]);

        $response->assertCreated()
            ->assertJsonPath('name', 'New Cashier')
            ->assertJsonPath('role', 'cashier')
            ->assertJsonPath('email', 'newcashier@example.com')
            ->assertJsonPath('active', true)
            ->assertJsonMissingPath('password')
            ->assertJsonMissingPath('pin');

        $this->assertDatabaseHas('users', [
            'name' => 'New Cashier',
            'role' => 'cashier',
            'email' => 'newcashier@example.com',
            'active' => true,
        ]);

        $created = User::where('email', 'newcashier@example.com')->first();
        $this->assertNotNull($created->password);
        $this->assertNotSame('secret-password', $created->password);
    }

    public function test_owner_creates_a_server_with_email_and_password(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->postJson('/api/employees', [
                'name' => 'New Server',
                'role' => 'server',
                'email' => 'newserver@example.com',
                'password' => 'secret-password',
            ]);

        $response->assertCreated()->assertJsonPath('role', 'server');
        $this->assertDatabaseHas('users', ['email' => 'newserver@example.com', 'role' => 'server']);
    }

    public function test_owner_creates_another_owner_with_email_and_password(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->postJson('/api/employees', [
                'name' => 'New Owner',
                'role' => 'owner',
                'email' => 'newowner@example.com',
                'password' => 'secret-password',
            ]);

        $response->assertCreated()->assertJsonPath('role', 'owner');
        $this->assertDatabaseHas('users', ['email' => 'newowner@example.com', 'role' => 'owner']);
    }

    public function test_owner_creates_a_kitchen_employee_with_a_pin(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->postJson('/api/employees', [
                'name' => 'New Cook',
                'role' => 'kitchen',
                'pin' => '135790',
            ]);

        $response->assertCreated()
            ->assertJsonPath('name', 'New Cook')
            ->assertJsonPath('role', 'kitchen')
            ->assertJsonPath('has_pin', true)
            ->assertJsonMissingPath('pin')
            ->assertJsonMissingPath('password');

        $this->assertDatabaseHas('users', [
            'name' => 'New Cook',
            'role' => 'kitchen',
            'pin' => '135790',
            'active' => true,
        ]);
    }

    public function test_creating_a_login_role_without_email_is_rejected(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->postJson('/api/employees', [
                'name' => 'New Cashier',
                'role' => 'cashier',
                'password' => 'secret-password',
            ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_creating_a_login_role_without_password_is_rejected(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->postJson('/api/employees', [
                'name' => 'New Cashier',
                'role' => 'cashier',
                'email' => 'newcashier@example.com',
            ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('password');
    }

    public function test_creating_a_kitchen_employee_without_a_pin_is_rejected(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->postJson('/api/employees', [
                'name' => 'New Cook',
                'role' => 'kitchen',
            ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('pin');
    }

    public function test_creating_a_kitchen_employee_with_a_non_six_digit_pin_is_rejected(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->postJson('/api/employees', [
                'name' => 'New Cook',
                'role' => 'kitchen',
                'pin' => '12',
            ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('pin');
    }

    public function test_duplicate_email_is_rejected(): void
    {
        User::factory()->cashier()->create(['email' => 'taken@example.com']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->postJson('/api/employees', [
                'name' => 'New Cashier',
                'role' => 'cashier',
                'email' => 'taken@example.com',
                'password' => 'secret-password',
            ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->assertDatabaseCount('users', 2); // owner used for the token + the pre-existing cashier
    }

    public function test_duplicate_pin_is_rejected(): void
    {
        User::factory()->kitchen('246810')->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->postJson('/api/employees', [
                'name' => 'New Cook',
                'role' => 'kitchen',
                'pin' => '246810',
            ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('pin');
    }

    public function test_invalid_role_is_rejected(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->postJson('/api/employees', [
                'name' => 'New Person',
                'role' => 'manager',
                'email' => 'newperson@example.com',
                'password' => 'secret-password',
            ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('role');
    }
}
