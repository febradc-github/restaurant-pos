<?php

namespace Tests\Feature\TimeEntries;

use App\Enums\UserRole;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Exercises the time_entries table/model directly (C-11): the columns the
 * spec requires, and querying rows by user_id and role. The login/logout
 * side effects that populate this table are covered by
 * tests/Feature/Auth/LoginTest.php and LogoutTest.php.
 */
class TimeEntryTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_time_entry_has_the_required_columns(): void
    {
        $server = User::factory()->server()->create();

        $entry = TimeEntry::create([
            'user_id' => $server->id,
            'role' => UserRole::Server,
            'clock_in' => now(),
        ]);

        $this->assertDatabaseHas('time_entries', [
            'id' => $entry->id,
            'user_id' => $server->id,
            'role' => 'server',
            'clock_out' => null,
            'auto_closed' => false,
        ]);
        $this->assertNotNull($entry->clock_in);
        $this->assertFalse($entry->fresh()->auto_closed);
    }

    public function test_entries_are_queryable_by_user_id(): void
    {
        $server = User::factory()->server()->create();
        $otherServer = User::factory()->server()->create();

        $ownEntry = TimeEntry::factory()->create(['user_id' => $server->id, 'role' => 'server']);
        TimeEntry::factory()->create(['user_id' => $otherServer->id, 'role' => 'server']);

        $results = TimeEntry::forUser($server->id)->get();

        $this->assertCount(1, $results);
        $this->assertSame($ownEntry->id, $results->first()->id);
    }

    public function test_entries_are_queryable_by_role(): void
    {
        $cashierEntry = TimeEntry::factory()->create(['role' => 'cashier']);
        TimeEntry::factory()->create(['role' => 'server']);

        $results = TimeEntry::forRole(UserRole::Cashier)->get();

        $this->assertCount(1, $results);
        $this->assertSame($cashierEntry->id, $results->first()->id);
    }

    public function test_entries_are_queryable_by_user_id_and_role_together(): void
    {
        $server = User::factory()->server()->create();

        $matching = TimeEntry::factory()->create(['user_id' => $server->id, 'role' => 'server']);
        // Same user, different role snapshot -- shouldn't match a role-scoped query for 'cashier'.
        TimeEntry::factory()->create(['user_id' => $server->id, 'role' => 'cashier']);
        // Same role, different user -- shouldn't match a user-scoped query for $server.
        TimeEntry::factory()->create(['role' => 'server']);

        $results = TimeEntry::forUser($server->id)->forRole('server')->get();

        $this->assertCount(1, $results);
        $this->assertSame($matching->id, $results->first()->id);
    }

    public function test_entries_are_queryable_by_clock_in_date_range(): void
    {
        $inRange = TimeEntry::factory()->create(['clock_in' => '2026-07-10 09:00:00']);
        TimeEntry::factory()->create(['clock_in' => '2026-07-05 09:00:00']);
        TimeEntry::factory()->create(['clock_in' => '2026-07-20 09:00:00']);

        $results = TimeEntry::clockedInBetween('2026-07-08', '2026-07-15')->get();

        $this->assertCount(1, $results);
        $this->assertSame($inRange->id, $results->first()->id);
    }

    public function test_clocked_in_between_with_only_a_from_bound_matches_everything_after_it(): void
    {
        TimeEntry::factory()->create(['clock_in' => '2026-07-05 09:00:00']);
        $afterFrom = TimeEntry::factory()->create(['clock_in' => '2026-07-20 09:00:00']);

        $results = TimeEntry::clockedInBetween('2026-07-08', null)->get();

        $this->assertCount(1, $results);
        $this->assertSame($afterFrom->id, $results->first()->id);
    }

    public function test_clocked_in_between_with_only_a_to_bound_matches_everything_before_it(): void
    {
        $beforeTo = TimeEntry::factory()->create(['clock_in' => '2026-07-05 09:00:00']);
        TimeEntry::factory()->create(['clock_in' => '2026-07-20 09:00:00']);

        $results = TimeEntry::clockedInBetween(null, '2026-07-15')->get();

        $this->assertCount(1, $results);
        $this->assertSame($beforeTo->id, $results->first()->id);
    }
}
