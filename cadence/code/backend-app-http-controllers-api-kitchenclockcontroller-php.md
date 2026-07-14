---
type: file
tags: [code/backend]
aliases: ["backend/app/Http/Controllers/Api/KitchenClockController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-user-php]]", "[[app-models-timeentry-php]]", "[[routes-api-php]]", "[[US-12]]", "[[US-21]]", "[[EP-10]]", "[[EP-20]]"]
sources: []
---

# backend/app/Http/Controllers/Api/KitchenClockController.php

Controller for PIN-based kitchen staff time tracking (C-12). Handles POST /api/kitchen/clock with no authentication (unlike Cashier/Server Sanctum flows).

## Exports
- `clock(Request)` -- POST handler. Accepts `{ pin }`, validates format, looks up Kitchen user by PIN, checks `active` flag (C-21), toggles time_entries (closes open entry if exists, creates new one otherwise). Returns 422 ValidationException for both malformed and unrecognized valid-format PINs with identical message 'Invalid PIN.' so PIN enumeration is not possible. C-21 deactivation check is folded into the same error branch.

## Pattern

The single-message error response (malformed vs. unrecognized vs. deactivated) prevents timing attacks and PIN guessing enumeration. Response includes employee name on success for immediate user feedback. Writes to the same `time_entries` table as C-11's Sanctum flow, using identical "clock_out IS NULL" convention for open entries.
