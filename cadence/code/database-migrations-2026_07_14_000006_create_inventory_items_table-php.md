---
type: file
tags: [code/backend]
aliases: ["database/migrations/2026_07_14_000006_create_inventory_items_table.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-inventoryitem-php]]", "[[database-factories-inventoryitemfactory-php]]", "[[US-5]]"]
sources: []
---

# database/migrations/2026_07_14_000006_create_inventory_items_table.php

Creates the inventory_items table to track stock levels for kitchen supplies and ingredients. Schema: id (PK), name (string), stock (unsigned integer, default 0), timestamps. No soft deletes. Used by inventory tracking to flag menu items unavailable when stock reaches zero.

## Exports
- Table schema: id, name, stock, created_at, updated_at

## Imports
- Laravel Migration, Schema, Blueprint
