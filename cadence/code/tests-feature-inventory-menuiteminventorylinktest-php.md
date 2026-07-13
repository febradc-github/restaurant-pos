---
type: file
tags: [code/backend]
aliases: ["tests/Feature/Inventory/MenuItemInventoryLinkTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-menuitem-php]]", "[[app-models-inventoryitem-php]]", "[[app-http-controllers-api-menuiteminventoryitemcontroller-php]]", "[[US-5]]"]
sources: []
---

# tests/Feature/Inventory/MenuItemInventoryLinkTest.php

Feature tests for linking and unlinking inventory items to menu items. Tests cover:
- link() owner-gated attach with quantity_required pivot data
- unlink() owner-gated detach
- Constraints: unique per (menu_item, inventory_item) pair, cascade behavior

Confirms owner-gating and pivot table constraints. ~10 tests.

## Imports
- Laravel TestCase, DatabaseTransactions
- [[app-models-menuitem-php]] -- MenuItem model
- [[app-models-inventoryitem-php]] -- InventoryItem model
- Database factories
