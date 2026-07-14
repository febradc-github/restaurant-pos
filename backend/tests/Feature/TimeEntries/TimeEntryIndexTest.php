<?php

namespace Tests\Feature\TimeEntries;

use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * GET /api/time-entries (C-13): a pure data/query surface -- filters
 * time_entries by user_id, role, and a clock_in date range, and returns
 * each row's auto_closed status. Owner-only, same role-gate pattern as the
 * other Owner-only endpoints. No aggregation or UI here -- that belongs to
 * the not-yet-built Owner analytics dashboard epic that will consume this.
 */
class TimeEntryIndexTest extends TestCase
{
    use RefreshDatabase;

    private function ownerToken(): string
    {
        $owner = User::factory()->owner()->create();

        return $owner->createToken('test-token')->plainTextToken;
    }

    public function test_requires_authentication(): void
    {
        $response = $this->getJson('/api/time-entries');

        $response->assertUnauthorized();
    }

    public function test_non_owner_roles_are_forbidden(): void
    {
        $cashier = User::factory()->cashier()->create();
        $token = $cashier->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/time-entries');

        $response->assertForbidden();
    }

    public function test_lists_every_entry_with_its_auto_closed_status_by_default(): void
    {
        $normal = TimeEntry::factory()->clockedOut()->create(['auto_closed' => false]);
        $autoClosed = TimeEntry::factory()->create(['clock_out' => now(), 'auto_closed' => true]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/time-entries');

        $response->assertOk();
        $ids = collect($response->json())->pluck('id');
        $this->assertTrue($ids->contains($normal->id));
        $this->assertTrue($ids->contains($autoClosed->id));

        $normalPayload = collect($response->json())->firstWhere('id', $normal->id);
        $autoClosedPayload = collect($response->json())->firstWhere('id', $autoClosed->id);
        $this->assertFalse($normalPayload['auto_closed']);
        $this->assertTrue($autoClosedPayload['auto_closed']);
    }

    public function test_filters_by_user_id(): void
    {
        $server = User::factory()->server()->create();
        $mine = TimeEntry::factory()->create(['user_id' => $server->id, 'role' => 'server']);
        TimeEntry::factory()->create(['role' => 'server']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson("/api/time-entries?user_id={$server->id}");

        $response->assertOk();
        $ids = collect($response->json())->pluck('id');
        $this->assertEquals([$mine->id], $ids->all());
    }

    public function test_filters_by_role(): void
    {
        $cashierEntry = TimeEntry::factory()->create(['role' => 'cashier']);
        TimeEntry::factory()->create(['role' => 'server']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/time-entries?role=cashier');

        $response->assertOk();
        $ids = collect($response->json())->pluck('id');
        $this->assertEquals([$cashierEntry->id], $ids->all());
    }

    public function test_filters_by_date_range(): void
    {
        $inRange = TimeEntry::factory()->create(['clock_in' => '2026-07-10 09:00:00']);
        TimeEntry::factory()->create(['clock_in' => '2026-06-01 09:00:00']);
        TimeEntry::factory()->create(['clock_in' => '2026-08-01 09:00:00']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/time-entries?from=2026-07-01&to=2026-07-31');

        $response->assertOk();
        $ids = collect($response->json())->pluck('id');
        $this->assertEquals([$inRange->id], $ids->all());
    }

    public function test_a_to_bound_on_the_same_day_as_an_entry_still_includes_it(): void
    {
        // The "to" date is inclusive of the entire day, not just midnight.
        $sameDay = TimeEntry::factory()->create(['clock_in' => '2026-07-15 18:00:00']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson('/api/time-entries?to=2026-07-15');

        $response->assertOk();
        $ids = collect($response->json())->pluck('id');
        $this->assertTrue($ids->contains($sameDay->id));
    }

    public function test_combines_user_id_role_and_date_range_filters(): void
    {
        $server = User::factory()->server()->create();
        $matching = TimeEntry::factory()->create([
            'user_id' => $server->id,
            'role' => 'server',
            'clock_in' => '2026-07-10 09:00:00',
        ]);
        // Same user/role, outside the date range.
        TimeEntry::factory()->create([
            'user_id' => $server->id,
            'role' => 'server',
            'clock_in' => '2026-06-01 09:00:00',
        ]);
        // Same date range, different user.
        TimeEntry::factory()->create(['role' => 'server', 'clock_in' => '2026-07-10 09:00:00']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->ownerToken())
            ->getJson("/api/time-entries?user_id={$server->id}&role=server&from=2026-07-01&to=2026-07-31");

        $response->assertOk();
        $ids = collect($response->json())->pluck('id');
        $this->assertEquals([$matching->id], $ids->all());
    }
}
