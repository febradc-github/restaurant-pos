<?php

namespace Tests\Feature\Auth;

use App\Models\TimeEntry;
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

    public function test_server_logout_closes_the_callers_open_time_entry(): void
    {
        $server = User::factory()->server()->create();
        $token = $server->createToken('test-token')->plainTextToken;
        $entry = TimeEntry::factory()->create(['user_id' => $server->id, 'role' => 'server']);

        $this->travelTo(now()->addMinutes(30));

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout');

        $response->assertOk();

        $this->assertDatabaseHas('time_entries', [
            'id' => $entry->id,
            'clock_out' => now(),
        ]);
    }

    public function test_cashier_logout_closes_the_callers_open_time_entry(): void
    {
        $cashier = User::factory()->cashier()->create();
        $token = $cashier->createToken('test-token')->plainTextToken;
        $entry = TimeEntry::factory()->create(['user_id' => $cashier->id, 'role' => 'cashier']);

        $this->travelTo(now()->addMinutes(30));

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout');

        $response->assertOk();

        $this->assertDatabaseHas('time_entries', [
            'id' => $entry->id,
            'clock_out' => now(),
        ]);
    }

    public function test_owner_logout_does_not_touch_any_time_entry(): void
    {
        $owner = User::factory()->owner()->create();
        $token = $owner->createToken('test-token')->plainTextToken;

        // An open entry belonging to someone else must never be closed by
        // an unrelated user's logout.
        $otherEntry = TimeEntry::factory()->create(['role' => 'cashier']);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout');

        $response->assertOk();

        $this->assertNull($otherEntry->fresh()->clock_out);
    }

    public function test_server_logout_only_closes_that_users_open_entry_not_another_users(): void
    {
        $server = User::factory()->server()->create();
        $token = $server->createToken('test-token')->plainTextToken;
        $ownEntry = TimeEntry::factory()->create(['user_id' => $server->id, 'role' => 'server']);
        $otherEntry = TimeEntry::factory()->create(['role' => 'server']);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout');

        $response->assertOk();

        $this->assertNotNull($ownEntry->fresh()->clock_out);
        $this->assertNull($otherEntry->fresh()->clock_out);
    }
}
