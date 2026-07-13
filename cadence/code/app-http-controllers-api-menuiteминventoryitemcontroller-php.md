---
type: file
tags: [code/backend]
aliases: ["app/Http/Controllers/Api/MenuItemInventoryItemController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-menuitem-php]]", "[[app-models-inventoryitem-php]]", "[[app-http-middleware-ensureuserhasrole-php]]", "[[US-5]]"]
sources: []
---

# app/Http/Controllers/Api/MenuItemInventoryItemController.php

Controller for linking and unlinking inventory items to/from menu items. All endpoints are Owner-gated.

- `link()` -- POST /api/menu-items/{menuItem}/inventory-items (owner-gated). Attaches an inventory item to a menu item with pivot quantity_required. Triggers syncAvailability() on the menu item.
- `unlink()` -- DELETE /api/menu-items/{menuItem}/inventory-items/{inventoryItem} (owner-gated). Detaches an inventory item. Does NOT resync menu item's availability (available flag persists at last manual/auto state).

## Exports
- `link()` -- Attach inventory item to menu item
- `unlink()` -- Detach inventory item from menu item

## Imports
- [[app-models-menuitem-php]] -- MenuItem model
- [[app-models-inventoryitem-php]] -- InventoryItem model
- Laravel Controller, Request validation, Authorization

## Used by
- [[routes-api-php]] -- registered at /api/menu-items/{menuItem}/inventory-items
