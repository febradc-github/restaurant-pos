---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/TimeEntries/TimeEntryTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-timeentry-php]]", "[[database-migrations-2026_07_14_000011_create_time_entries_table-php]]", "[[US-11]]", "[[EP-10]]"]
sources: []
---

# backend/tests/Feature/TimeEntries/TimeEntryTest.php

Feature tests for TimeEntry model and scopes. Verifies: time_entries table has expected columns (user_id, role, clock_in, clock_out, auto_closed); scopeForUser() filters correctly; scopeForRole() filters correctly; scopes chain (forUser + forRole together).

## Exports
- Test cases for TimeEntry model: schema validation, individual scopes, scope chaining
