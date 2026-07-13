---
type: file
tags: [code/backend]
aliases: ["database/migrations/2026_07_14_000007_create_menu_item_inventory_item_table.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-menuitem-php]]", "[[app-models-inventoryitem-php]]", "[[US-5]]"]
sources: []
---

# database/migrations/2026_07_14_000007_create_menu_item_inventory_item_table.php

Creates the menu_item_inventory_item pivot table linking menu items to inventory items. Schema: menu_item_id, inventory_item_id (composite PK), quantity_required (int, default 1, must be >= 1), timestamps. Unique composite constraint on (menu_item_id, inventory_item_id). Cascade deletes on both foreign keys.

**quantity_required** specifies how many stock units are consumed per one order of the linked menu item. Used by Order Taking (C-6) to decrement inventory when an order is placed.

## Exports
- Pivot table schema: menu_item_id, inventory_item_id, quantity_required, created_at, updated_at

## Imports
- Laravel Migration, Schema, Blueprint
