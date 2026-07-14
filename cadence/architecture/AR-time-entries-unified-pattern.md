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

Both C-11 (Sanctum login/logout for Cashier/Server) and C-12 (PIN-based clock for Kitchen) write to the same `time_entries` table, using a unified "open entry" convention.

## Pattern

An **open entry** is a row where `clock_out IS NULL`. Both flows create and close entries using identical logic:

- **Clock-in:** Insert new row with `clock_out = NULL`, other fields set per flow
- **Clock-out:** Update existing open entry, set `clock_out = NOW()`

The `role` column stores which role created the entry (as a plain string, not enum-constrained), but the clock-out logic is agnostic to role. Both flows use the same TimeEntry model and queries.

## Benefit for C-13 (Auto-Close Forgotten Entries)

C-13's background job finds stale entries with a single query:

```
TimeEntry::whereNull('clock_out')->where('updated_at', '<', now()->subHours(8))->get()
```

No per-role branching needed. The job updates matching entries, setting `auto_closed = true` to indicate the system closed them (vs. a manual user clock-out).

## Columns and Defaults

- `clock_out` -- NULL by default. C-13 auto-close is the only flow that sets entries to `auto_closed = true`. After C-12, all auto_closed values remain false (schema default).
- `auto_closed` -- boolean, default false. Remains untouched until C-13.

## Benefits

- Single schema and logic for all attendance flows
- No branching logic in background jobs
- Easy to add new attendance flows in the future (e.g., biometric clock-in)
- Role field captures which flow created each entry for audit/reporting
