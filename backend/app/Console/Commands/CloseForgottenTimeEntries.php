<?php

namespace App\Console\Commands;

use App\Models\TimeEntry;
use Carbon\Carbon;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * Forgotten clock-out auto-close (C-13). Finds every time_entries row still
 * open (clock_out IS NULL) whose applicable daily cutoff
 * (config('attendance.time_entry_auto_close_cutoff')) has already passed
 * and closes it: clock_out is stamped with that cutoff instant and
 * auto_closed is set to true. An entry whose cutoff hasn't occurred yet --
 * including one clocked in earlier today -- is left untouched.
 *
 * Scheduled daily in routes/console.php via Schedule::command(), but safe
 * to run at any time: it compares "now" against each entry's own
 * applicable cutoff rather than assuming it always runs exactly at the
 * cutoff instant.
 */
#[Signature('time-entries:auto-close')]
#[Description('Close every forgotten (still open, past cutoff) time entry.')]
class CloseForgottenTimeEntries extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $cutoffTime = config('attendance.time_entry_auto_close_cutoff');
        $now = Carbon::now();
        $closed = 0;

        TimeEntry::whereNull('clock_out')->each(function (TimeEntry $entry) use ($cutoffTime, $now, &$closed) {
            $cutoff = $this->applicableCutoff($entry->clock_in, $cutoffTime);

            if ($now->greaterThanOrEqualTo($cutoff)) {
                $entry->update([
                    'clock_out' => $cutoff,
                    'auto_closed' => true,
                ]);

                $closed++;
            }
        });

        $this->info("Auto-closed {$closed} forgotten time entry(ies).");

        return self::SUCCESS;
    }

    /**
     * The next occurrence of the cutoff time-of-day at or after clock-in.
     * If the cutoff on the clock-in's own calendar day is still ahead of
     * clock-in, that same day's cutoff applies; otherwise it rolls to the
     * following day.
     */
    private function applicableCutoff(Carbon $clockIn, string $cutoffTime): Carbon
    {
        $cutoff = $clockIn->copy()->setTimeFromTimeString($cutoffTime);

        if ($cutoff->lessThanOrEqualTo($clockIn)) {
            $cutoff->addDay();
        }

        return $cutoff;
    }
}
