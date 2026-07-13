---
type: file
tags: [code/backend]
aliases: ["database/migrations/2026_07_14_000003_create_tables_table.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["app-models-table-php", "app-enums-tableshape-php", "[[US-3]]"]
sources: []
---

# database/migrations/2026_07_14_000003_create_tables_table.php

Laravel migration creating the `tables` table schema: label (string), shape (backed enum: round/square/rectangular), capacity (integer), and floor-plan position/size fields (x, y, width, height as floats). Foundation for the TableLayout Editor (C-3).

## Exports
- `up()` -- creates tables table with timestamps
- `down()` -- drops tables table