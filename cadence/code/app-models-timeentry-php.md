---
type: file
tags: [code/backend]
aliases: ["backend/app/Models/TimeEntry.php"]
created: 2026-07-14
updated: 2026-07-15
related: ["[[database-migrations-2026_07_14_000011_create_time_entries_table-php]]", "[[database-factories-timeentryfactory-php]]", "[[app-http-controllers-api-authcontroller-php]]", "[[backend-app-http-controllers-api-kitchenclockcontroller-php]]", "[[app-http-controllers-api-timeentrycontroller-php]]", "[[backend-console-commands-closeforgottentimeentries-php]]", "[[backend-database-seeders-databaseseeder-php]]", "[[AR-time-entries-unified-pattern]]", "[[US-11]]", "[[US-12]]", "[[US-13]]", "[[EP-10]]"]
sources: []
---

# backend/app/Models/TimeEntry.php

Eloquent model for time_entries table. Provides local scopes for filtering by user, role, and date range. Scopes are chainable (e.g. `TimeEntry::forUser($id)->forRole('server')->clockedInBetween('2026-01-01', '2026-01-31')`). Used by Sanctum login/logout (AuthController, C-11), PIN-based clock (KitchenClockController, C-12), auto-close job (C-13), and the time-entries API (C-13).

## Exports
- `TimeEntry` class -- Eloquent model
- `scopeForUser($query, $userId)` -- local scope: filters by user_id
- `scopeForRole($query, $role)` -- local scope: filters by role (string value)
- `scopeClockedInBetween($query, ?string $from, ?string $to)` -- local scope: filters on `clock_in` timestamp. Parameters are date strings (YYYY-MM-DD); both optional. If provided, treats dates as inclusive range (from 00:00:00 to next day 00:00:00 for $to). Used by TimeEntryController API filters.

## Pattern

Both C-11 (Sanctum login/logout for Cashier/Server) and C-12 (PIN clock for Kitchen) write to the same table using the unified "open row = `clock_out IS NULL`" convention. See [[AR-time-entries-unified-pattern]] for details.
