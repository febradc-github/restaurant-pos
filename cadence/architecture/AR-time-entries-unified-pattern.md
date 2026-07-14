---
type: architecture
tags: [backend]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[c11-time-entries-infrastructure-readiness]]", "[[US-11]]", "[[US-12]]", "[[US-13]]", "[[EP-10]]"]
sources: []
---

# Unified Time Entries Pattern: Multi-Flow Attendance

Both C-11 (Sanctum login/logout for Cashier/Server) and C-12 (PIN-based clock for Kitchen) write to the same `time_entries` table, using a unified "open entry" convention. C-13 completes the pattern with scheduled auto-close and a read API for owner analytics.

## Pattern

An **open entry** is a row where `clock_out IS NULL`. Both flows create and close entries using identical logic:

- **Clock-in:** Insert new row with `clock_out = NULL`, other fields set per flow
- **Clock-out:** Update existing open entry, set `clock_out = NOW()`

The `role` column stores which role created the entry (as a plain string, not enum-constrained), but the clock-out logic is agnostic to role. Both flows use the same TimeEntry model and queries.

## Auto-Close & Forgotten-Entry Handling (C-13)

C-13 adds a scheduled job (`time-entries:auto-close`, registered in `routes/console.php`) that runs daily at a configurable time-of-day (via `config('attendance.time_entry_auto_close_cutoff')`):

1. Finds all entries with `clock_out IS NULL` (open entries)
2. For each, computes the next occurrence of the configured cutoff time at or after `clock_in`
3. If `now() >= that cutoff`, closes the entry: sets `clock_out` to the cutoff instant and `auto_closed = true`

This flags forgotten check-outs without data loss. The cutoff time is configurable (not hardcoded to midnight), so the repo can adjust the closing time per deployment.

## Read API for Analytics (C-13)

C-13 adds `GET /api/time-entries` (owner-gated, role:owner) to surface attendance data for future dashboards:

- Filters by `user_id`, `role`, `from`/`to` (filters on `clock_in`, not `clock_out`)
- Returns raw JSON rows including `auto_closed` per row, no aggregation
- Callers can distinguish manual clock-outs from system-forced closures

For future dashboards reporting by shift-end date (grouped by clock_out, not clock_in), a new endpoint or additional logic would be required.

## Benefit for Unified Attendance

C-13's background job finds stale entries with a single query:

```
TimeEntry::whereNull('clock_out')->where('updated_at', '<', now()->subHours(8))->get()
```

No per-role branching needed. The job updates matching entries, setting `auto_closed = true` to indicate the system closed them (vs. a manual user clock-out).

## Columns and Defaults

- `clock_out` -- NULL by default. C-13 auto-close is the only flow that sets entries to `auto_closed = true`. After C-12, all auto_closed values remain false (schema default).
- `auto_closed` -- boolean, default false. Untouched by C-11/C-12; only set to true by C-13's auto-close job.

## Benefits

- Single schema and logic for all attendance flows
- No branching logic in background jobs
- Role field captures which flow created each entry for audit/reporting
- Auto-close is cutoff-agnostic; easy to deploy with different cutoff times per site
- Owner-gated read API standardizes data access for future dashboards (no direct model queries from frontend)
