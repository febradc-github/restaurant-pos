<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_log_in_with_identifier_and_password(): void
    {
        $owner = User::factory()->owner()->create([
            'email' => 'owner@example.com',
            'password' => bcrypt('secret-password'),
        ]);

        $response = $this->postJson('/api/login', [
            'identifier' => 'owner@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('user.role', 'owner');

        $this->assertNotNull($owner->fresh());
    }

    public function test_cashier_can_log_in_with_identifier_and_password(): void
    {
        User::factory()->cashier()->create([
            'email' => 'cashier@example.com',
            'password' => bcrypt('secret-password'),
        ]);

        $response = $this->postJson('/api/login', [
            'identifier' => 'cashier@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('user.role', 'cashier');
    }

    public function test_server_can_log_in_with_identifier_and_password(): void
    {
        User::factory()->server()->create([
            'email' => 'server@example.com',
            'password' => bcrypt('secret-password'),
        ]);

        $response = $this->postJson('/api/login', [
            'identifier' => 'server@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('user.role', 'server');
    }

    public function test_server_login_creates_a_time_entry_with_clock_in_set(): void
    {
        $server = User::factory()->server()->create([
            'email' => 'server@example.com',
            'password' => bcrypt('secret-password'),
        ]);

        $this->travelTo(now());

        $response = $this->postJson('/api/login', [
            'identifier' => 'server@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('time_entries', [
            'user_id' => $server->id,
            'role' => 'server',
            'clock_in' => now(),
            'clock_out' => null,
            'auto_closed' => false,
        ]);
        $this->assertDatabaseCount('time_entries', 1);
    }

    public function test_cashier_login_creates_a_time_entry_with_clock_in_set(): void
    {
        $cashier = User::factory()->cashier()->create([
            'email' => 'cashier@example.com',
            'password' => bcrypt('secret-password'),
        ]);

        $this->travelTo(now());

        $response = $this->postJson('/api/login', [
            'identifier' => 'cashier@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('time_entries', [
            'user_id' => $cashier->id,
            'role' => 'cashier',
            'clock_in' => now(),
            'clock_out' => null,
        ]);
        $this->assertDatabaseCount('time_entries', 1);
    }

    public function test_owner_login_does_not_create_a_time_entry(): void
    {
        User::factory()->owner()->create([
            'email' => 'owner@example.com',
            'password' => bcrypt('secret-password'),
        ]);

        $response = $this->postJson('/api/login', [
            'identifier' => 'owner@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertOk();

        $this->assertDatabaseCount('time_entries', 0);
    }

    public function test_login_is_rejected_with_wrong_password(): void
    {
        User::factory()->owner()->create([
            'email' => 'owner@example.com',
            'password' => bcrypt('secret-password'),
        ]);

        $response = $this->postJson('/api/login', [
            'identifier' => 'owner@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertUnprocessable();
    }

    public function test_login_is_rejected_for_unknown_identifier(): void
    {
        $response = $this->postJson('/api/login', [
            'identifier' => 'nobody@example.com',
            'password' => 'whatever',
        ]);

        $response->assertUnprocessable();
    }

    public function test_session_persists_across_requests_using_the_issued_token(): void
    {
        User::factory()->owner()->create([
            'email' => 'owner@example.com',
            'password' => bcrypt('secret-password'),
        ]);

        $login = $this->postJson('/api/login', [
            'identifier' => 'owner@example.com',
            'password' => 'secret-password',
        ]);

        $token = $login->json('token');

        // The same token authenticates a second, independent request.
        $first = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/owner/dashboard');
        $second = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/owner/dashboard');

        $first->assertOk();
        $second->assertOk();
    }
}
