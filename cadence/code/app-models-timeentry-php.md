---
type: file
tags: [code/backend]
aliases: ["backend/app/Models/TimeEntry.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[database-migrations-2026_07_14_000011_create_time_entries_table-php]]", "[[database-factories-timeentryfactory-php]]", "[[US-11]]", "[[EP-10]]"]
sources: []
---

# backend/app/Models/TimeEntry.php

Eloquent model for time_entries table. Provides local scopes for filtering by user and role. Scopes are chainable (e.g. `TimeEntry::forUser($id)->forRole('server')`).

## Exports
- `TimeEntry` class -- Eloquent model
- `scopeForUser($query, $userId)` -- local scope: filters by user_id
- `scopeForRole($query, $role)` -- local scope: filters by role (string value)
