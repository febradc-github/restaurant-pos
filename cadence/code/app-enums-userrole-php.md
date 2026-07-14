---
type: file
tags: [code/backend]
aliases: ["app/Enums/UserRole.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-2]]", "[[US-11]]", "[[US-12]]", "[[EP-10]]"]
sources: []
---

# app/Enums/UserRole.php

Backed enum for the User model's role field. Defines four application roles: Owner, Cashier, Server, Kitchen. All four cases are now present (Server was added in C-11; Kitchen was added in C-12).

## Exports
- `UserRole` enum with cases: `Owner`, `Cashier`, `Server`, `Kitchen`

## Pattern

Prior versions were incomplete (missing Server and Kitchen). As of C-12, the enum fully reflects the application's role structure: Owner (admin), Cashier (point-of-sale), Server (floor/table management), Kitchen (pin-based clock in/out). All four roles have corresponding User records, factory states, and controllers.
