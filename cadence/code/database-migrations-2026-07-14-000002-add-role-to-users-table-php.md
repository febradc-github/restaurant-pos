---
type: file
tags: [code/backend]
aliases: ["database/migrations/2026_07_14_000002_add_role_to_users_table.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-enums-userrole-php]]", "[[US-2]]"]
sources: []
---

# database/migrations/2026_07_14_000002_add_role_to_users_table.php

Adds role column to users table, cast to UserRole enum. Carries a default value for new rows.

## Exports
- `up()` -- adds role column to users
- `down()` -- drops role column from users
