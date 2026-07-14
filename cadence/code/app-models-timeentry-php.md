---
type: file
tags: [code/backend]
aliases: ["backend/app/Models/TimeEntry.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[database-migrations-2026_07_14_000011_create_time_entries_table-php]]", "[[database-factories-timeentryfactory-php]]", "[[app-http-controllers-api-authcontroller-php]]", "[[backend-app-http-controllers-api-kitchenclockcontroller-php]]", "[[AR-time-entries-unified-pattern]]", "[[US-11]]", "[[US-12]]", "[[US-13]]", "[[EP-10]]"]
sources: []
---

# backend/app/Models/TimeEntry.php

Eloquent model for time_entries table. Provides local scopes for filtering by user and role. Scopes are chainable (e.g. `TimeEntry::forUser($id)->forRole('server')`). Used by both Sanctum login/logout (AuthController, C-11) and PIN-based clock (KitchenClockController, C-12).

## Exports
- `TimeEntry` class -- Eloquent model
- `scopeForUser($query, $userId)` -- local scope: filters by user_id
- `scopeForRole($query, $role)` -- local scope: filters by role (string value)

## Pattern

Both C-11 (Sanctum login/logout for Cashier/Server) and C-12 (PIN clock for Kitchen) write to the same table using the unified "open row = `clock_out IS NULL`" convention. See [[AR-time-entries-unified-pattern]] for details.
