---
type: file
tags: [code/backend]
aliases: ["backend/app/Http/Controllers/Api/RestockController.php"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[app-models-order-php]]", "[[app-models-inventoryitem-php]]", "[[routes-api-php]]", "[[backend-tests-feature-inventory-restocktest-php]]", "[[AR-live-computed-suggestions-vs-snapshots]]", "[[AR-chainable-query-scopes-for-analytics]]", "[[US-25]]", "[[EP-23]]"]
sources: []
---

# backend/app/Http/Controllers/Api/RestockController.php

Owner-gated inventory restock API. Computes per-ingredient live reorder suggestions on every request (no caching, no scheduled jobs) from trailing-30-day consumed quantities via OrderItem pivot. Dedicated controller following C-24's pattern: cross-cutting concerns (analytics, restock) live in their own controller, not folded into the resource's original CRUD.

## Exports
- `index(Request)` -- GET /api/inventory-items/restock, role:owner-gated. Returns combined live report per ingredient with fields: `{id, name, stock, threshold, suggested_threshold, shortfall}`. Consumption summed via `menu_item_inventory_item` pivot `quantity_required` across every `OrderItem` on a Paid order (reusing `Order::scopePaid()`) with `paid_at` in trailing 30 days. Suggested threshold = ceil(totalConsumedInTrailing30Days / 30), deliberately rounded up to err toward "enough to not run out." Zero-history items get suggested_threshold = 0. Shortfall = max(0, threshold - stock) computed against currently-set threshold.
- `update(Request, InventoryItem)` -- PATCH /api/inventory-items/{inventoryItem}/threshold, role:owner-gated. Validates threshold as non-negative integer, persists to DB, returns updated InventoryItem. Owner-override endpoint for setting reorder thresholds manually.

## Validation
- `threshold` (update endpoint): required, integer, min:0

## Design Note
Deliberately separate from InventoryItemController's general PATCH endpoint (which accepts only name/stock fields). Threshold mutation goes exclusively through RestockController::update(), keeping "who can change what" surface explicit. Mirrors C-24's AnalyticsController pattern: new cross-cutting concerns get dedicated controllers rather than extending the resource's original CRUD.

## Imports
- app/Models/Order (scopePaid)
- app/Models/InventoryItem
- Laravel request validation, timestamps
