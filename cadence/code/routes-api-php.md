---
type: file
tags: [code/backend]
aliases: ["routes/api.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-http-controllers-api-tablecontroller-php]]", "[[app-http-controllers-api-categorycontroller-php]]", "[[app-http-controllers-api-menuitemcontroller-php]]", "[[app-http-controllers-api-inventoryitemcontroller-php]]", "[[app-http-controllers-api-menuiteminventoryitemcontroller-php]]", "[[app-http-controllers-api-ordercontroller-php]]", "[[backend-app-http-controllers-api-kitchenclockcontroller-php]]", "[[app-http-controllers-api-timeentrycontroller-php]]", "[[US-3]]", "[[US-4]]", "[[US-5]]", "[[US-6]]", "[[US-12]]", "[[US-13]]"]
sources: []
---

# routes/api.php

API route definitions. Defines public GET endpoints and Owner-gated mutations in role:owner group for POST/PATCH/DELETE, using auth:sanctum + role middleware (C-2/C-3 pattern). All controllers follow same grouping. C-6 adds no-auth order endpoints (server/kitchen device pattern). C-12 adds kitchen clock endpoint. C-13 adds owner-gated time-entries listing.

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
- GET /api/inventory-items → InventoryItemController@index (open)
- POST /api/inventory-items → InventoryItemController@store (role:owner)
- PATCH /api/inventory-items/{inventoryItem} → InventoryItemController@update (role:owner)
- DELETE /api/inventory-items/{inventoryItem} → InventoryItemController@destroy (role:owner)
- POST /api/menu-items/{menuItem}/inventory-items → MenuItemInventoryItemController@link (role:owner)
- DELETE /api/menu-items/{menuItem}/inventory-items/{inventoryItem} → MenuItemInventoryItemController@unlink (role:owner)
- GET /api/orders → OrderController@index (no auth, supports ?status= filter)
- POST /api/orders → OrderController@store (no auth)
- PATCH /api/orders/{order}/ready → OrderController@markReady (no auth)
- POST /api/kitchen/clock → KitchenClockController@clock (no auth, C-12)
- GET /api/time-entries → TimeEntryController@index (role:owner, C-13, supports ?user_id=, ?role=, ?from=, ?to= filters)

## Imports
- app/Http/Controllers/Api/TableController
- app/Http/Controllers/Api/CategoryController
- app/Http/Controllers/Api/MenuItemController
- app/Http/Controllers/Api/InventoryItemController
- app/Http/Controllers/Api/MenuItemInventoryItemController
- app/Http/Controllers/Api/OrderController
- app/Http/Controllers/Api/KitchenClockController
- app/Http/Controllers/Api/TimeEntryController
