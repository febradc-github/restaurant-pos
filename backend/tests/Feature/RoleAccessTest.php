<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return $user->createToken('test-token')->plainTextToken;
    }

    public function test_owner_can_access_the_owner_only_route(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->getJson('/api/owner/dashboard');

        $response->assertOk()->assertJsonPath('message', 'Owner dashboard');
    }

    public function test_cashier_is_rejected_from_the_owner_only_route(): void
    {
        $cashier = User::factory()->cashier()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->getJson('/api/owner/dashboard');

        $response->assertForbidden();
    }

    public function test_unauthenticated_request_is_rejected_from_the_owner_only_route(): void
    {
        $response = $this->getJson('/api/owner/dashboard');

        $response->assertUnauthorized();
    }

    public function test_cashier_can_access_the_cashier_only_route(): void
    {
        $cashier = User::factory()->cashier()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($cashier))
            ->getJson('/api/cashier/dashboard');

        $response->assertOk()->assertJsonPath('message', 'Cashier dashboard');
    }

    public function test_owner_is_rejected_from_the_cashier_only_route(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->tokenFor($owner))
            ->getJson('/api/cashier/dashboard');

        $response->assertForbidden();
    }

    public function test_unauthenticated_request_is_rejected_from_the_cashier_only_route(): void
    {
        $response = $this->getJson('/api/cashier/dashboard');

        $response->assertUnauthorized();
    }

    public function test_status_route_succeeds_with_no_token_at_all(): void
    {
        // Proves the routing/middleware model supports the "no login"
        // access pattern that Server and Kitchen views rely on.
        $response = $this->getJson('/api/status');

        $response->assertOk()->assertJsonPath('status', 'ok');
    }
}
