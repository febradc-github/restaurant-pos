---
type: file
tags: [code/backend]
aliases: ["app/Models/Table.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["app-enums-tableshape-php", "app-http-controllers-api-tablecontroller-php", "database-factories-tablefactory-php", "[[US-3]]"]
sources: []
---

# app/Models/Table.php

Eloquent model for the tables resource. Uses #[Fillable] attribute for label, shape, capacity, x, y, width, height. Casts shape to TableShape enum and position/size fields to float/integer respectively.

## Exports
- Fillable properties: label, shape, capacity, x, y, width, height
- Shape cast to TableShape enum
- Position/size casts to float/integer

## Imports
- Laravel Eloquent Model
- `app/Enums/TableShape` -- shape enum cast