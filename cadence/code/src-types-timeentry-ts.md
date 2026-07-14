---
type: file
tags: [code/frontend]
aliases: ["src/types/timeEntry.ts"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[src-api-timeentries-ts]]", "[[src-components-attendanceaggregation-ts]]", "[[src-components-analyticsdashboard-tsx]]", "[[US-26]]", "[[EP-10]]"]
sources: []
---

# src/types/timeEntry.ts

TypeScript types for time entry data from backend Time Entries API (C-13, used by C-26 Analytics Dashboard).

## Exports
- `TimeEntry` -- `{id: number, user_id: number, role: string, clock_in: string, clock_out: string | null, auto_closed: boolean}` where clock_in and clock_out are ISO timestamps, clock_out may be null for still-open entries

## Imports
(none)

## Used by
- [[src-api-timeentries-ts|src/api/timeEntries.ts]] -- type signature for list() return
- [[src-components-attendanceaggregation-ts|src/components/attendanceAggregation.ts]] -- input type for aggregation function
- [[src-components-analyticsdashboard-tsx|src/components/AnalyticsDashboard.tsx]] -- typed props for attendance table
