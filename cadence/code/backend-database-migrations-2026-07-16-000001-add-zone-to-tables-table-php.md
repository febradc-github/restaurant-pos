---
type: file
tags: [code/backend]
aliases: ["backend/database/migrations/2026_07_16_000001_add_zone_to_tables_table.php"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[backend-app-models-table-php]]", "[[C-37]]"]
sources: []
---

# backend/database/migrations/2026_07_16_000001_add_zone_to_tables_table.php

Additive migration adding zone support to tables (C-37). Adds a nullable `zone` string column positioned after the `label` column.

## Changes

- **up()**: adds `string('zone')->nullable()->after('label')` to the tables table
- **down()**: drops the zone column

## Notes

- Nullable by design: existing tables have no zone assigned until explicitly set
- Positioned after `label` for readability in raw database inspection
- No unique constraint on zone (many tables can share the same zone)

## Used by
- Laravel migration system during deployment/rollback
- [[backend-app-models-table-php|Table model]] -- adds persistence for `zone` attribute
