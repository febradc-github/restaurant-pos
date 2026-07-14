---
type: file
tags: [code/backend]
aliases: ["backend/config/attendance.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[backend-console-commands-closeforgottentimeentries-php]]", "[[routes-console-php]]", "[[US-13]]", "[[EP-10]]"]
sources: []
---

# backend/config/attendance.php

Configuration file for attendance system settings. New in C-13 to centralize time-entry auto-close behavior.

## Exports
- `time_entry_auto_close_cutoff` -- string, reads from env `TIME_ENTRY_AUTO_CLOSE_CUTOFF` with default `'00:00'`. Controls the daily time-of-day cutoff for the auto-close job (e.g., `'00:00'` = midnight, `'02:00'` = 2 AM). Format is `HH:mm` as a 24-hour string.

## Usage
- Loaded by `CloseForgottenTimeEntries` command via `config('attendance.time_entry_auto_close_cutoff')`
- Registered in scheduler (`routes/console.php`) to set the job's execution time
