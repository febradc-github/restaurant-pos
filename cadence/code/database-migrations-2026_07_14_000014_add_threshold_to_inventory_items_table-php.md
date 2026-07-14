---
type: file
tags: [code/backend]
aliases: ["backend/database/migrations/2026_07_14_000014_add_threshold_to_inventory_items_table.php"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[app-models-inventoryitem-php]]", "[[app-http-controllers-api-restockcontroller-php]]", "[[US-25]]", "[[EP-23]]"]
sources: []
---

# backend/database/migrations/2026_07_14_000014_add_threshold_to_inventory_items_table.php

Adds unsignedInteger `threshold` column to inventory_items table, default 0. Supports C-25 inventory reorder API. Column represents the owner-set minimum stock level for each ingredient; used by RestockController to compute shortfall (max(0, threshold - stock)) on every dashboard request.

## Exports
- Migration up() adds `threshold` column, down() drops it
