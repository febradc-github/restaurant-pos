---
type: file
tags: [code/backend]
aliases: ["app/Models/Category.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-http-controllers-api-categorycontroller-php]]", "[[database-migrations-2026_07_14_000004_create_categories_table-php]]", "[[US-4]]"]
sources: []
---

# app/Models/Category.php

Eloquent model for menu categories. Fillable: name. Relationship: menuItems() hasMany.

## Exports
- `menuItems()` -- BelongsToMany or HasMany relationship to MenuItem

## Imports
- Laravel Eloquent Model, Fillable attribute