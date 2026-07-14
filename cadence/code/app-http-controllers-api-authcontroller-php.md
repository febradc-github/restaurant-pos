---
type: file
tags: [code/backend]
aliases: ["app/Http/Controllers/Api/AuthController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-enums-userrole-php]]", "[[app-http-middleware-ensureuserhasrole-php]]", "[[routes-api-php]]", "[[app-models-timeentry-php]]", "[[backend-app-http-controllers-api-kitchenclockcontroller-php]]", "[[AR-time-entries-unified-pattern]]", "[[US-2]]", "[[US-11]]", "[[US-12]]", "[[EP-10]]"]
sources: []
---

# app/Http/Controllers/Api/AuthController.php

Login and logout actions for Sanctum bearer token auth. Login accepts identifier (email/phone) + password and issues a plainTextToken via Sanctum's createToken(). For Cashier/Server users, login also creates a time_entries row with clock_in = now(); Owner login excluded. Logout revokes the current token and closes the caller's open time_entries row (clock_out = now()), if one exists; uses latest('clock_in') to find the correct row if multiple open entries somehow exist. Owner logout is a no-op re time_entries.

## Exports
- `login(Request)` -- accepts identifier + password, returns bearer token, creates time_entries row for Cashier/Server
- `logout(Request)` -- revokes current token, closes caller's open time_entries row (Cashier/Server), returns success response

## Pattern

Sanctum login/logout is one of two time_entries flows (C-11). Kitchen staff use the separate PIN-based flow (KitchenClockController, C-12). Both flows write to the same table using the unified "open row = `clock_out IS NULL`" convention documented in [[AR-time-entries-unified-pattern]].
