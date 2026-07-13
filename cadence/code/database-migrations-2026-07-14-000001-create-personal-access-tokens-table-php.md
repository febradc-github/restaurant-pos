---
type: file
tags: [code/backend]
aliases: ["database/migrations/2026_07_14_000001_create_personal_access_tokens_table.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-2]]"]
sources: []
---

# database/migrations/2026_07_14_000001_create_personal_access_tokens_table.php

Sanctum personal access tokens table migration. Creates the token_key (polymorphic), token (hashed), name, abilities, last_used_at, and expires_at columns. Required for bearer token authentication.

## Exports
- `up()` -- creates personal_access_tokens table
- `down()` -- drops personal_access_tokens table
