---
type: file
tags: [code/backend]
aliases: ["backend/routes/console.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[backend-console-commands-closeforgottentimeentries-php]]", "[[config-attendance-php]]", "[[US-13]]", "[[EP-10]]"]
sources: []
---

# backend/routes/console.php

Scheduled task registration. Laravel 11+ convention: no app/Console/Kernel.php exists. All scheduled commands are registered here directly via the `Schedule` facade.

## Exports
- Scheduled task registrations via `Schedule::command(...)` fluent API

## Current Tasks
- `time-entries:auto-close` -- runs daily at the time configured in `config('attendance.time_entry_auto_close_cutoff')` (e.g., `->dailyAt('00:00')` for midnight, C-13)

## Note for Future Tickets
This is the first scheduled task in the project. Any future tickets adding background jobs or cron tasks should register them here, not in a Kernel file (which does not exist in this Laravel 11+ setup).
