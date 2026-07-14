---
type: file
tags: [code/backend]
aliases: ["backend/database/migrations/2026_07_14_000013_add_active_to_users_table.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-user-php]]", "[[US-21]]", "[[EP-20]]"]
sources: []
---

# backend/database/migrations/2026_07_14_000013_add_active_to_users_table.php

Adds `active` boolean column to `users` table with default value `true`. Part of C-21 employee deactivation feature.

## Pattern

New employees default to active. Deactivation is non-destructive (rows remain in time_entries and orders, only login and PIN-based clock operations reject deactivated users). AuthController and KitchenClockController check this flag before issuing credentials or completing PIN validation.
