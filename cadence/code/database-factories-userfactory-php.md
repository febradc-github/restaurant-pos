---
type: file
tags: [code/backend]
aliases: ["backend/database/factories/UserFactory.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[database-factories-timeentryfactory-php]]", "[[US-2]]", "[[US-11]]", "[[EP-10]]"]
sources: []
---

# backend/database/factories/UserFactory.php

Factory for User model in tests. Defines default states for creating test users with various roles. Provides state methods: `->cashier()` (existing, pre-C-11), `->server()` (added in C-11), for role-specific user creation in tests.

## Exports
- `definition()` -- returns array of default attributes for User creation
- `cashier()` -- state method: creates user with role='cashier'
- `server()` -- state method: creates user with role='server' (added in C-11)
