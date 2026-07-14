---
type: file
tags: [code/backend]
aliases: ["backend/database/migrations/2026_07_14_000012_add_pin_to_users_table.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-user-php]]", "[[US-12]]", "[[EP-10]]"]
sources: []
---

# backend/database/migrations/2026_07_14_000012_add_pin_to_users_table.php

Migration adding the `pin` column for Kitchen staff PIN-based authentication (C-12). Creates a nullable VARCHAR column with a unique index on `pin`. Nullable allows non-Kitchen users to have no PIN; Postgres allows multiple NULL values under a unique index, so this doesn't block regular user creation.

## Pattern

PIN is stored unencrypted in the database (no hashing). The unique index enables fast PIN lookup in KitchenClockController. Nullable + unique index pattern ensures PIN existence is not enforced at the schema level.
