---
type: file
tags: [code/backend]
aliases: ["backend/app/Console/Commands/CloseForgottenTimeEntries.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-timeentry-php]]", "[[config-attendance-php]]", "[[routes-console-php]]", "[[database-migrations-2026_07_14_000011_create_time_entries_table-php]]", "[[US-13]]", "[[EP-10]]"]
sources: []
---

# backend/app/Console/Commands/CloseForgottenTimeEntries.php

Artisan command that auto-closes stale time entries. Runs on a schedule via `routes/console.php`.

## Exports
- `time-entries:auto-close` -- command signature. Processes all open time entries and closes any whose applicable cutoff time has passed.

## Behavior

For every `TimeEntry` with `clock_out IS NULL`:
1. Compute the entry's applicable daily cutoff: the next occurrence of the configured time-of-day (from `config('attendance.time_entry_auto_close_cutoff')`) at or after the entry's `clock_in` timestamp.
2. If `now()` >= that cutoff, close the entry: set `clock_out` to the cutoff instant and `auto_closed = true`.
3. Cutoff time is configurable and timezone-agnostic by design. Verified to work correctly with non-default cutoffs (e.g., 02:00) in tests.

## Imports
- `app/Models/TimeEntry`
- Laravel console `Command` class
- `Carbon\Carbon` for time computation
