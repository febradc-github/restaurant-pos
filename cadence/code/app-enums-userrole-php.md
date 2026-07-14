---
type: file
tags: [code/backend]
aliases: ["app/Enums/UserRole.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-2]]", "[[US-11]]", "[[EP-10]]"]
sources: []
---

# app/Enums/UserRole.php

Backed enum for the User model's role field. Defines four application roles: Owner, Cashier, Server, Kitchen.

Note: Prior documentation incorrectly stated all four cases were present from the start. In reality, the pre-C-11 file only contained Owner and Cashier; Server was missing despite being referenced in architectural notes (C-11 added the missing Server case). Kitchen remains implemented but with a separate lightweight PIN authentication layer (not full Sanctum login). This discrepancy was discovered during C-11's implementation; future references to this enum are verified-against-source.

## Exports
- `UserRole` enum with cases: `Owner`, `Cashier`, `Server`, `Kitchen`
