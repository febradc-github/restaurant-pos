<?php

namespace Tests\Feature\TimeEntries;

use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Forgotten clock-out auto-close (C-13). The scheduled
 * time-entries:auto-close command finds every still-open time_entries row
 * (clock_out IS NULL) whose applicable daily cutoff (config/attendance.php)
 * has already passed and closes it, stamping clock_out with that cutoff
 * instant and auto_closed = true. A row whose cutoff hasn't occurred yet is
 * left untouched -- a shift in progress must never be closed early.
 */
class AutoCloseTimeEntriesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // A fixed, non-midnight cutoff makes "before/after today's cutoff"
        // meaningful within a single calendar day for these tests.
        config(['attendance.time_entry_auto_close_cutoff' => '02:00']);
    }

    public function test_an_open_entry_from_a_previous_day_past_the_cutoff_is_auto_closed(): void
    {
        $server = User::factory()->server()->create();

        $this->travelTo('2026-07-13 09:00:00');
        $entry = TimeEntry::factory()->create([
            'user_id' => $server->id,
            'role' => 'server',
            'clock_in' => now(),
            'clock_out' => null,
        ]);

        // Past the following day's 02:00 cutoff.
        $this->travelTo('2026-07-14 03:00:00');
        $this->artisan('time-entries:auto-close')->assertSuccessful();

        $this->assertDatabaseHas('time_entries', [
            'id' => $entry->id,
            'clock_out' => '2026-07-14 02:00:00',
            'auto_closed' => true,
        ]);
    }

    public function test_an_open_entry_from_today_before_todays_cutoff_is_left_untouched(): void
    {
        $server = User::factory()->server()->create();

        // Clocked in today, after today's 02:00 cutoff already elapsed for
        // *yesterday's* row above, but before the *next* occurrence of the
        // cutoff (tomorrow 02:00) that applies to this entry.
        $this->travelTo('2026-07-14 09:00:00');
        $entry = TimeEntry::factory()->create([
            'user_id' => $server->id,
            'role' => 'server',
            'clock_in' => now(),
            'clock_out' => null,
        ]);

        $this->artisan('time-entries:auto-close')->assertSuccessful();

        $entry->refresh();
        $this->assertNull($entry->clock_out);
        $this->assertFalse($entry->auto_closed);
    }

    public function test_an_open_entry_clocked_in_before_todays_cutoff_is_closed_once_that_cutoff_passes(): void
    {
        $server = User::factory()->server()->create();

        // Clocked in at 01:00, before today's 02:00 cutoff -- so that same
        // day's 02:00 is the applicable cutoff, not tomorrow's.
        $this->travelTo('2026-07-14 01:00:00');
        $entry = TimeEntry::factory()->create([
            'user_id' => $server->id,
            'role' => 'server',
            'clock_in' => now(),
            'clock_out' => null,
        ]);

        $this->travelTo('2026-07-14 02:30:00');
        $this->artisan('time-entries:auto-close')->assertSuccessful();

        $this->assertDatabaseHas('time_entries', [
            'id' => $entry->id,
            'clock_out' => '2026-07-14 02:00:00',
            'auto_closed' => true,
        ]);
    }

    public function test_a_normally_closed_entry_is_never_touched_by_the_job(): void
    {
        $server = User::factory()->server()->create();

        $this->travelTo('2026-07-13 09:00:00');
        $entry = TimeEntry::factory()->create([
            'user_id' => $server->id,
            'role' => 'server',
            'clock_in' => now(),
            'clock_out' => now()->addHours(8),
            'auto_closed' => false,
        ]);

        $this->travelTo('2026-07-14 03:00:00');
        $this->artisan('time-entries:auto-close')->assertSuccessful();

        $entry->refresh();
        $this->assertEquals('2026-07-13 17:00:00', $entry->clock_out->format('Y-m-d H:i:s'));
        $this->assertFalse($entry->auto_closed);
    }

    public function test_multiple_stale_entries_across_different_users_and_roles_are_all_closed(): void
    {
        $server = User::factory()->server()->create();
        $cashier = User::factory()->cashier()->create();

        $this->travelTo('2026-07-13 09:00:00');
        $serverEntry = TimeEntry::factory()->create([
            'user_id' => $server->id,
            'role' => 'server',
            'clock_in' => now(),
            'clock_out' => null,
        ]);
        $cashierEntry = TimeEntry::factory()->create([
            'user_id' => $cashier->id,
            'role' => 'cashier',
            'clock_in' => now(),
            'clock_out' => null,
        ]);

        $this->travelTo('2026-07-14 03:00:00');
        $this->artisan('time-entries:auto-close')->assertSuccessful();

        $this->assertTrue($serverEntry->fresh()->auto_closed);
        $this->assertTrue($cashierEntry->fresh()->auto_closed);
    }
}
