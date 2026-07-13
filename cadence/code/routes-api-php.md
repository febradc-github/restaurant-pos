---
type: file
tags: [code/backend]
aliases: ["routes/api.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-http-controllers-api-tablecontroller-php]]", "[[app-http-controllers-api-categorycontroller-php]]", "[[app-http-controllers-api-menuitemcontroller-php]]", "[[US-3]]", "[[US-4]]"]
sources: []
---

# routes/api.php

API route definitions. Defines public GET /api/tables and /api/categories, /api/menu-items endpoints. Owner-gated mutations in role:owner group for POST/PATCH/DELETE, using auth:sanctum + role middleware (C-2/C-3 pattern). Both table and menu controllers follow same grouping.

## Exports
- GET /api/tables → TableController@index (open)
- POST /api/tables → TableController@store (role:owner)
- PATCH /api/tables/{table} → TableController@update (role:owner)
- DELETE /api/tables/{table} → TableController@destroy (role:owner)
- GET /api/categories → CategoryController@index (open)
- POST /api/categories → CategoryController@store (role:owner)
- PATCH /api/categories/{category} → CategoryController@update (role:owner)
- DELETE /api/categories/{category} → CategoryController@destroy (role:owner)
- GET /api/menu-items → MenuItemController@index (open, optional ?category_id filter)
- POST /api/menu-items → MenuItemController@store (role:owner)
- PATCH /api/menu-items/{item} → MenuItemController@update (role:owner)
- DELETE /api/menu-items/{item} → MenuItemController@destroy (role:owner)

## Imports
- app/Http/Controllers/Api/TableController
- app/Http/Controllers/Api/CategoryController
- app/Http/Controllers/Api/MenuItemController