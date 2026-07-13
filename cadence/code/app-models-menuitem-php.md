---
type: file
tags: [code/backend]
aliases: ["app/Models/MenuItem.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-http-controllers-api-menuitemcontroller-php]]", "[[database-migrations-2026_07_14_000005_create_menu_items_table-php]]", "[[laravel-decimal-json-serialization-gotcha]]", "[[US-4]]"]
sources: []
---

# app/Models/MenuItem.php

Eloquent model for menu items. Fillable: name, price, category_id, available. Casts: price to decimal:2 (serializes to JSON as fixed-point string, not number), available to boolean. Relationship: category() belongsTo.

**Important:** price casts to decimal:2, which serializes JSON as a string (e.g., "12.50"), not a number. Frontend must type MenuItem.price as string, not number, to avoid precision loss on round-trip.

## Exports
- `category()` -- BelongsTo relationship to Category

## Imports
- Laravel Eloquent Model, Fillable, Casts attributes