<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Time Entry Auto-Close Cutoff (C-13)
    |--------------------------------------------------------------------------
    |
    | The time of day (24-hour "H:i" format) at which a still-open
    | time_entries row (clock_out IS NULL) is considered forgotten and
    | eligible for auto-close. The scheduled time-entries:auto-close command
    | runs at this cutoff every day and closes any row whose applicable
    | cutoff has already passed, setting clock_out to that cutoff instant
    | and auto_closed to true. A row from later today, whose cutoff hasn't
    | occurred yet, is left untouched.
    |
    */

    'time_entry_auto_close_cutoff' => env('TIME_ENTRY_AUTO_CLOSE_CUTOFF', '00:00'),

];
