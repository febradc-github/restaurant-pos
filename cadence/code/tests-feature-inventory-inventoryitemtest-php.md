---
type: file
tags: [code/backend]
aliases: ["tests/Feature/Inventory/InventoryItemTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-inventoryitem-php]]", "[[app-http-controllers-api-inventoryitemcontroller-php]]", "[[US-5]]"]
sources: []
---

# tests/Feature/Inventory/InventoryItemTest.php

Feature tests for InventoryItem CRUD endpoints. Tests cover:
- index() open access (no auth required)
- store() owner-gated creation with validation
- update() owner-gated stock adjustment via PATCH
- destroy() owner-gated deletion with cascade cleanup

Confirms owner-gating authorization and validation rules. ~10 tests.

## Imports
- Laravel TestCase, DatabaseTransactions
- [[app-models-inventoryitem-php]] -- InventoryItem model
- Database factories
