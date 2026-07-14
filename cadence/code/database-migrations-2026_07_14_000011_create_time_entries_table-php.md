---
type: file
tags: [code/backend]
aliases: ["backend/database/migrations/2026_07_14_000011_create_time_entries_table.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-timeentry-php]]", "[[US-11]]", "[[EP-10]]"]
sources: []
---

# backend/database/migrations/2026_07_14_000011_create_time_entries_table.php

Creates time_entries table to record Server and Cashier clock-in/clock-out timestamps. Each entry tracks a single work session linked to a user and a role snapshot.

## Exports
- `up()` -- creates time_entries table with columns: id (PK), user_id (FK), role (string snapshot), clock_in (timestamp), clock_out (nullable timestamp), auto_closed (boolean, default false)
- `down()` -- drops time_entries table
