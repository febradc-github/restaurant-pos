---
type: file
tags: [code/backend]
aliases: ["backend/database/factories/InventoryItemFactory.php"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[app-models-inventoryitem-php]]", "[[backend-tests-feature-inventory-restocktest-php]]", "[[US-25]]", "[[EP-23]]"]
sources: []
---

# backend/database/factories/InventoryItemFactory.php

Eloquent factory for InventoryItem model. Defines default state for testing: name is faked, stock defaults to 10 (arbitrary safe non-zero), threshold defaults to 0 (new C-25 field).

## Exports
- Factory definition with default states for name, stock, threshold
