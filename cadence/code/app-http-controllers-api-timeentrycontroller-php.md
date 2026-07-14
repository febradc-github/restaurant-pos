---
type: file
tags: [code/backend]
aliases: ["backend/app/Http/Controllers/Api/TimeEntryController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-timeentry-php]]", "[[routes-api-php]]", "[[US-13]]", "[[EP-10]]"]
sources: []
---

# backend/app/Http/Controllers/Api/TimeEntryController.php

Read-only API controller for time entries. Provides owner-gated access to attendance/hours data for future analytics and payroll features.

## Exports
- `index()` -- GET /api/time-entries, role:owner-gated. Returns raw JSON rows (no aggregation).

## Query Parameters (all optional)
- `user_id` -- integer, filters by user_id
- `role` -- string, filters by role (e.g., 'server', 'kitchen', 'cashier')
- `from` -- date string (YYYY-MM-DD), validated; filters on `clock_in >= from 00:00:00`
- `to` -- date string (YYYY-MM-DD), validated; filters on `clock_in <= to 23:59:59` (normalized to end-of-day so date-only values include same-day entries with a time component)

## Response Format

Raw time_entries rows including:
- `id`, `user_id`, `role`, `clock_in`, `clock_out` (nullable), `auto_closed` (boolean)
- No aggregation or computed fields

## Design

Filters by `clock_in`, not `clock_out`. For a future dashboard reporting by shift-end date, this API does not support that use case directly (would require additional filtering/grouping logic in the dashboard or a new endpoint). Rows carry `auto_closed` so callers can distinguish manual clock-outs from system-forced closures due to forgotten check-outs.

## Imports
- `app/Models/TimeEntry`
- Laravel controller and validation traits
