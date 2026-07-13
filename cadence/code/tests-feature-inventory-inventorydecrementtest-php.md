---
type: file
tags: [code/backend]
aliases: ["tests/Feature/Inventory/InventoryDecrementTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-inventoryitem-php]]", "[[app-models-menuitem-php]]", "[[US-5]]", "[[US-6]]"]
sources: []
---

# tests/Feature/Inventory/InventoryDecrementTest.php

Feature tests for decrementStock() method and its side effects. Tests cover:
- decrementStock() reduces stock, clamps to zero (never negative)
- throws InvalidArgumentException for quantity < 1
- Fires updated event, triggering syncAvailability() on linked menu items
- zero-stock-auto-unavailable: when any linked inventory item reaches zero, its menu items are flagged unavailable
- owner-gating: only owner can adjust stock via controller

Includes real mutation checks confirming the auto-unavailable resync logic is not vacuous. ~10 tests.

## Imports
- Laravel TestCase, DatabaseTransactions
- [[app-models-inventoryitem-php]] -- InventoryItem model
- [[app-models-menuitem-php]] -- MenuItem model
- Database factories
