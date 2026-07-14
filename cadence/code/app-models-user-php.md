---
type: file
tags: [code/backend]
aliases: ["backend/app/Models/User.php"]
created: 2026-07-14
updated: 2026-07-15
related: ["[[app-enums-userrole-php]]", "[[backend-database-seeders-databaseseeder-php]]", "[[US-2]]", "[[US-11]]", "[[US-12]]", "[[US-21]]", "[[EP-10]]", "[[EP-20]]"]
sources: []
---

# backend/app/Models/User.php

Eloquent User model for all application roles (Owner, Cashier, Server, Kitchen). Uses `role` column backed by UserRole enum.

## Attributes (as of C-21)

- Fillable: includes `pin` (C-12) and `active` (C-21)
- Hidden: includes `pin` and `password` (defense-in-depth; ensures neither serializes to JSON response even if User is returned directly)
- Casts: includes `active` as `boolean` (C-21)

## Pattern

PIN and password are marked Hidden to prevent accidental exposure in API responses. The `->kitchen()` factory state (C-12) creates Kitchen role users with optional PIN and auto-generated placeholder email/password for test isolation. Active flag defaults to true and is deliberately NOT hidden (Owner UI needs to read it). Sanctum tokens are issued only for Owner/Cashier/Server roles (via AuthController); Kitchen uses PIN-based KitchenClockController instead.
