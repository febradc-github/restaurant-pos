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
