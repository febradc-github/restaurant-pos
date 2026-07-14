---
type: file
tags: [code/backend]
aliases: ["backend/app/Http/Controllers/Api/EmployeeController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-user-php]]", "[[routes-api-php]]", "[[src-api-employees-ts]]", "[[src-components-employeemanager-tsx]]", "[[US-21]]", "[[US-22]]", "[[EP-20]]"]
sources: []
---

# backend/app/Http/Controllers/Api/EmployeeController.php

Owner-gated controller for managing employees (all roles). Protected by `auth:sanctum` + `role:owner` middleware.

## Exports
- `index()` -- GET /api/employees, lists all employees
- `store(Request)` -- POST /api/employees, creates employee. Role-conditional validation: Owner/Cashier/Server require unique `email` + `password` (min:8); Kitchen requires unique 6-digit `pin`. Non-Kitchen employees created with placeholder `kitchen-<uuid>@internal.invalid` email and random 40-char password (never exposed in responses).
- `update(Request)` -- PATCH /api/employees/{user}, updates role and/or resets credential (password for login roles, PIN for Kitchen)
- `deactivate(Request)` -- PATCH /api/employees/{user}/deactivate, sets `active=false`. Rejects self-deactivation (422, `errors.user`) and deactivating the last active Owner (422, `errors.user`).
- `reactivate(Request)` -- PATCH /api/employees/{user}/reactivate, sets `active=true`

## Response shape (all five actions)

Uniform per-employee: `{id, name, email, role, active, has_pin}`. Email is `null` for Kitchen employees (masked). Neither `pin` nor `password` raw values are returned; `has_pin` is a boolean presence flag instead. Deactivate/reactivate never touch existing time_entries or orders rows (non-destructive).

## Pattern

Kitchen employees receive placeholder credentials (masked email, random password) to satisfy pre-C-21 database schema constraints (NOT NULL columns). AuthController and KitchenClockController validate `active` flag before authentication succeeds, using identical error responses as wrong password/invalid PIN to prevent user enumeration.
