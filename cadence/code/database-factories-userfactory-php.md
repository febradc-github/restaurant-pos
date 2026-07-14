---
type: file
tags: [code/backend]
aliases: ["backend/database/factories/UserFactory.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[database-factories-timeentryfactory-php]]", "[[app-enums-userrole-php]]", "[[US-2]]", "[[US-11]]", "[[US-12]]", "[[EP-10]]"]
sources: []
---

# backend/database/factories/UserFactory.php

Factory for User model in tests. Defines default states for creating test users with various roles.

## Exports
- `definition()` -- returns array of default attributes for User creation
- `cashier()` -- state method: creates user with role='cashier'
- `server()` -- state method: creates user with role='server' (added in C-11)
- `kitchen(?string $pin = null)` -- state method: creates user with role='kitchen', optional PIN parameter for test isolation. If no PIN provided, uses a default; explicit PIN prevents collisions when creating multiple Kitchen users in a single test.

## Pattern

State methods mirror the four UserRole enum cases: `->owner()`, `->cashier()`, `->server()`, `->kitchen()`. The `kitchen()` state's PIN parameter enables flexible test setup: `->kitchen('1234')` creates a user with PIN='1234', while `->kitchen()` uses the default PIN. This isolates test users and prevents unique-index collisions on the pin column.
