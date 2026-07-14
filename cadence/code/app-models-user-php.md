---
type: file
tags: [code/backend]
aliases: ["backend/app/Models/User.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-enums-userrole-php]]", "[[US-2]]", "[[US-11]]", "[[US-12]]", "[[EP-10]]"]
sources: []
---

# backend/app/Models/User.php

Eloquent User model for all application roles (Owner, Cashier, Server, Kitchen). Uses `role` column backed by UserRole enum.

## Attributes (as of C-12)

- Fillable: includes `pin` (C-12 addition for Kitchen staff PIN-based authentication)
- Hidden: includes `pin` (defense-in-depth; ensures PIN never serializes to JSON response even if User is returned directly)

## Pattern

PIN is marked Hidden to prevent accidental exposure in API responses. The `->kitchen()` factory state (C-12) creates Kitchen role users with optional PIN parameter for test isolation. Sanctum tokens are issued only for Owner/Cashier/Server roles (via AuthController); Kitchen uses PIN-based KitchenClockController instead.
