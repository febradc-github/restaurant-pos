---
type: file
tags: [code/backend]
aliases: ["app/Models/MenuItem.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-http-controllers-api-menuitemcontroller-php]]", "[[database-migrations-2026_07_14_000005_create_menu_items_table-php]]", "[[laravel-decimal-json-serialization-gotcha]]", "[[app-models-inventoryitem-php]]", "[[app-http-controllers-api-menuiteминventoryitemcontroller-php]]", "[[US-4]]", "[[US-5]]"]
sources: []
---

# app/Models/MenuItem.php

Eloquent model for menu items. Fillable: name, price, category_id, available. Casts: price to decimal:2 (serializes to JSON as fixed-point string, not number), available to boolean. Relationships: category() belongsTo, inventoryItems() BelongsToMany via pivot menu_item_inventory_item.

**Important:** price casts to decimal:2, which serializes JSON as a string (e.g., "12.50"), not a number. Frontend must type MenuItem.price as string, not number, to avoid precision loss on round-trip.

## Exports
- `category()` -- BelongsTo relationship to Category
- `inventoryItems()` -- BelongsToMany relationship to InventoryItem via menu_item_inventory_item pivot
- `syncAvailability(): void` -- Flags available=false if ANY linked inventory item stock is at zero; flags available=true if all linked items have stock > 0. Menu items with no inventory links are untouched (their available flag persists at last manual/auto state). Called automatically when a linked InventoryItem fires updated event after decrementStock().

## Imports
- Laravel Eloquent Model, BelongsTo, BelongsToMany, Fillable, Casts
