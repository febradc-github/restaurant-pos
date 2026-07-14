---
type: file
tags: [code/frontend]
aliases: ["src/components/attendanceAggregation.ts"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[src-types-timeentry-ts]]", "[[src-components-analyticsdashboard-tsx]]", "[[US-26]]"]
sources: []
---

# src/components/attendanceAggregation.ts

Pure function for aggregating raw time entry rows into per-employee summary metrics. No React or DOM dependency; independently unit-tested.

## Exports
- `aggregateAttendance(entries: TimeEntry[])` -- processes raw TimeEntry[] into aggregated summary per user_id+role, returning array of `{user_id, name, role, total_hours, in_progress, auto_closed_count}`

## Imports
- `src/types/timeEntry` -- TimeEntry type

## Used by
- [[src-components-analyticsdashboard-tsx|src/components/AnalyticsDashboard.tsx]] -- aggregates fetched time entries for attendance table display

## Behavior
- Sums clock_out - clock_in per user_id+role into total_hours
- Counts entries with null clock_out as "in progress" (still-clocked-in) rather than dropping them
- Counts auto_closed entries per employee for visibility into auto-close activity
- Returns sorted results
