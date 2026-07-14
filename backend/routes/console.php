<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Forgotten clock-out auto-close (C-13). Runs daily at the configured
// cutoff (config/attendance.php) and closes every time_entries row still
// open past that cutoff. See App\Console\Commands\CloseForgottenTimeEntries
// for the exact boundary rules.
Schedule::command('time-entries:auto-close')
    ->dailyAt(config('attendance.time_entry_auto_close_cutoff'));
