---
type: domain
tags: [backend/database]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-11]]", "[[US-12]]", "[[US-13]]", "[[EP-10]]"]
sources: []
---

# C-11 Time Entries Infrastructure Readiness for Future Tickets

C-11 (Server & Cashier Login-Based Time Tracking) established the foundation for the remaining attendance tickets in [[EP-10]]:

**For C-12 (Kitchen Pin-Based Attendance):**
- Kitchen staff will need real `UserRole::Kitchen` User records (not yet created; those come in C-12).
- The `time_entries.role` column is stored as a plain string (not FK-constrained to the UserRole enum), so a future `'kitchen'` value will fit without requiring a migration change.

**For C-13 (Auto-Close Forgotten Entries):**
- The `auto_closed` boolean column is already present in time_entries table (default false) and ready for C-13's background job to set true when force-closing stale entries.

No further database changes are needed for C-12 or C-13; the schema is forward-compatible with both tickets' requirements.
