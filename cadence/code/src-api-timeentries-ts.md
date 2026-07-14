---
type: file
tags: [code/frontend]
aliases: ["src/api/timeEntries.ts"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[src-types-timeentry-ts]]", "[[src-components-attendanceaggregation-ts]]", "[[src-components-analyticsdashboard-tsx]]", "[[app-http-controllers-api-timeentrycontroller-php]]", "[[US-26]]", "[[EP-10]]"]
sources: []
---

# src/api/timeEntries.ts

Frontend API client for time entries, wrapping the existing C-13 backend endpoint (no backend changes in C-26). Returns raw un-aggregated time entry rows.

## Exports
- `createTimeEntriesApi({baseUrl, token})` -- factory function returning the client object
  - `list(filters?: {user_id?: number, role?: string, from?: string, to?: string}): Promise<TimeEntry[]>` -- GET /api/time-entries with optional filters

## Imports
- `src/types/timeEntry` -- TimeEntry type
- `fetch` (built-in)

## Used by
- [[src-components-analyticsdashboard-tsx|src/components/AnalyticsDashboard.tsx]] -- fetches time entries for attendance aggregation
- [[src-components-attendanceaggregation-ts|src/components/attendanceAggregation.ts]] -- processes raw entries into aggregated per-employee hours

## Notes
Endpoint returns raw rows with only user_id (no employee name lookup); caller must join with employee data separately if needed. Each row includes clock_in, clock_out (may be null for still-open entries), and auto_closed flag.
