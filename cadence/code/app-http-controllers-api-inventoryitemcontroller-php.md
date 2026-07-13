---
type: file
tags: [code/backend]
aliases: ["app/Http/Controllers/Api/InventoryItemController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-inventoryitem-php]]", "[[app-http-middleware-ensureuserhasrole-php]]", "[[US-5]]"]
sources: []
---

# app/Http/Controllers/Api/InventoryItemController.php

REST controller for inventory item CRUD. All endpoints except index() are Owner-gated (middleware authorization). Implements standard resource actions with inventory-specific logic:

- `index()` -- GET /api/inventory-items (open, no auth)
- `store()` -- POST /api/inventory-items (owner-gated)
- `update()` -- PUT/PATCH /api/inventory-items/{inventoryItem} (owner-gated). PATCH adjusts stock directly via decrementStock() with quantity parameter.
- `destroy()` -- DELETE /api/inventory-items/{inventoryItem} (owner-gated). Cascade deletes linked menu_item_inventory_item pivot rows; does NOT resync linked menu items' availability.

## Exports
- Resource controller actions: index, store, update, destroy

## Imports
- [[app-models-inventoryitem-php]] -- InventoryItem model
- Laravel Controller, Request validation, Authorization

## Used by
- [[routes-api-php]] -- registered at /api/inventory-items
