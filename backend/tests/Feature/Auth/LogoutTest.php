<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_logout_revokes_the_current_token(): void
    {
        $owner = User::factory()->owner()->create();
        $token = $owner->createToken('test-token')->plainTextToken;

        $logout = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout');

        $logout->assertOk();

        // Sanctum's RequestGuard caches the resolved user for the lifetime of
        // the application container. A single test method reuses one
        // container across requests (unlike separate real-world requests,
        // each of which boots fresh), so the guard must be forgotten here to
        // force re-authentication against the now-deleted token.
        Auth::forgetGuards();

        $reused = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/owner/dashboard');

        $reused->assertUnauthorized();
    }

    public function test_logout_requires_authentication(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertUnauthorized();
    }
}
