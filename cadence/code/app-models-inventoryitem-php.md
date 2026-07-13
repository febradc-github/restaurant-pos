---
type: file
tags: [code/backend]
aliases: ["app/Models/InventoryItem.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[database-migrations-2026_07_14_000006_create_inventory_items_table-php]]", "[[app-models-menuitem-php]]", "[[app-http-controllers-api-inventoryitemcontroller-php]]", "[[US-5]]", "[[US-6]]"]
sources: []
---

# app/Models/InventoryItem.php

Eloquent model for inventory items. Fillable: name, stock. Casts: stock to integer. Relationship: menuItems() many-to-many through pivot menu_item_inventory_item.

## Exports
- `decrementStock(int $quantity): void` -- Reduce stock by quantity. Throws InvalidArgumentException if quantity < 1. Clamps stock to zero (never negative). Fires updated event after decrement, which triggers syncAvailability() on all linked menu items to resync their availability based on current zero-stock state.
- `menuItems()` -- HasMany Through (or BelongsToMany) relationship to MenuItem via pivot table

## Imports
- Laravel Eloquent Model, HasMany, BelongsToMany, Fillable, Casts

## Used by
- [[app-http-controllers-api-inventoryitemcontroller-php]] -- CRUD and stock adjustment
- [[app-http-controllers-api-menuiteминventoryitemcontroller-php]] -- link/unlink to menu items
- [[app-models-menuitem-php]] -- syncAvailability() listens to InventoryItem's updated event
