---
type: domain
tags: [backend]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-11]]", "[[US-12]]", "[[US-13]]", "[[EP-10]]", "[[AR-time-entries-unified-pattern]]"]
sources: []
---

# EP-10 Complete: Attendance & Extended RBAC

All three children of the Attendance & Extended RBAC epic ([[EP-10]]) are now implemented and integrated:

## Children Completed

1. **C-11 (Cashier/Server Clock)** -- Sanctum login/logout clocking: creates/closes time entries on sign-in/out
2. **C-12 (Kitchen PIN Clock)** -- No-auth PIN endpoint for kitchen staff: same time-entries table, PIN-based access
3. **C-13 (Auto-Close & Attendance API)** -- Scheduled job to close forgotten check-outs + owner-gated read API

## Unified Data Model

All three flows use the single `TimeEntry` model and schema:
- Both Sanctum and PIN create/close entries with identical logic (open = `clock_out IS NULL`)
- `role` column captures which flow created each entry
- `auto_closed` boolean flags system-forced closures vs. manual clock-outs

## Time-Entry Read Surface

New in C-13: `GET /api/time-entries` (owner-gated, role:owner) is the standard data source for:
- Current/future dashboards (attendance reporting, hours tracking)
- Payroll systems
- Any consumer of attendance data

Parameters: `user_id`, `role`, `from`, `to` (filters on `clock_in`)
Response: raw time_entries rows including `auto_closed` per row, no aggregation

## Auto-Close Behavior

Scheduled job `time-entries:auto-close` (runs daily at configurable `config('attendance.time_entry_auto_close_cutoff')`):
- Finds open entries whose applicable cutoff has passed
- Closes them, setting `clock_out` to cutoff instant and `auto_closed = true`
- Cutoff time is configurable (e.g., `'00:00'` for midnight, `'02:00'` for 2 AM)

## For Future Features

Attendance-dependent features (Owner dashboard, analytics, payroll integration) should:
1. Use `GET /api/time-entries` API to fetch data
2. Filter by `clock_in` date range (not `clock_out`)
3. Check `auto_closed` flag to exclude/flag forgotten-clockout rows from payroll math
4. For shift-end date reporting: group by `clock_out` date at the application level (API doesn't group by `clock_out`)
