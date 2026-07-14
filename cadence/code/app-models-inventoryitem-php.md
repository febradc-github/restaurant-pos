---
type: file
tags: [code/backend]
aliases: ["app/Models/InventoryItem.php"]
created: 2026-07-14
updated: 2026-07-15
related: ["[[database-migrations-2026_07_14_000006_create_inventory_items_table-php]]", "[[database-migrations-2026_07_14_000014_add_threshold_to_inventory_items_table-php]]", "[[app-models-menuitem-php]]", "[[app-http-controllers-api-inventoryitemcontroller-php]]", "[[app-http-controllers-api-restockcontroller-php]]", "[[backend-database-seeders-databaseseeder-php]]", "[[US-5]]", "[[US-6]]", "[[US-25]]"]
sources: []
---

# app/Models/InventoryItem.php

Eloquent model for inventory items. Fillable: name, stock, threshold. Casts: stock and threshold to integer. Relationship: menuItems() many-to-many through pivot menu_item_inventory_item.

## Exports
- `decrementStock(int $quantity): void` -- Reduce stock by quantity. Throws InvalidArgumentException if quantity < 1. Clamps stock to zero (never negative). Fires updated event after decrement, which triggers syncAvailability() on all linked menu items to resync their availability based on current zero-stock state.
- `menuItems()` -- BelongsToMany relationship to MenuItem via pivot table

## Imports
- Laravel Eloquent Model, BelongsToMany, Fillable, Casts

## Used by
- [[app-http-controllers-api-inventoryitemcontroller-php]] -- CRUD and stock adjustment
- [[app-http-controllers-api-menuiteminventoryitemcontroller-php]] -- link/unlink to menu items
- [[app-http-controllers-api-restockcontroller-php]] -- restock suggestion and threshold override
- [[app-models-menuitem-php]] -- syncAvailability() listens to InventoryItem's updated event
