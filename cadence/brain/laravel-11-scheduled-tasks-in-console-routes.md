---
type: process
tags: [backend]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[routes-console-php]]", "[[backend-console-commands-closeforgottentimeentries-php]]", "[[US-13]]"]
sources: []
---

# Laravel 11 Scheduled Tasks Convention

This project runs Laravel 11+, which changed the scheduler registration location.

## Key Difference from Laravel 10

- **Laravel 10 and earlier:** Scheduled tasks registered in `app/Console/Kernel.php` via the `schedule()` method
- **Laravel 11+:** No `app/Console/Kernel.php` file exists. Scheduled tasks are registered directly in `routes/console.php` via the `Schedule` facade

## Implementation

In `routes/console.php`, register commands using the fluent API:

```php
Schedule::command('command-name')->dailyAt('00:00');
Schedule::command('another-command')->everyFiveMinutes();
```

The first scheduled task in this project is `time-entries:auto-close` (C-13), registered as:

```php
Schedule::command('time-entries:auto-close')->dailyAt(config('attendance.time_entry_auto_close_cutoff'));
```

## For Future Tickets

Any feature requiring a scheduled job or cron task should register it in `routes/console.php`, not in a Kernel file.
