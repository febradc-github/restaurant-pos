---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/Inventory/RestockTest.php"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[app-http-controllers-api-restockcontroller-php]]", "[[app-models-inventoryitem-php]]", "[[app-models-order-php]]", "[[US-25]]", "[[EP-23]]"]
sources: []
---

# backend/tests/Feature/Inventory/RestockTest.php

Feature tests for inventory restock API (C-25). 13 test cases covering threshold defaults, 30-day windowing, suggestion computation, persistence, auth/role gating.

## Test Coverage
- Threshold column defaults to 0 on InventoryItem creation
- 30-day windowing: orders inside the trailing window contribute to suggested_threshold, outside the window are excluded
- Zero-history case: ingredient with no OrderItem consumption in 30 days gets suggested_threshold = 0
- Non-Paid-order exclusion: Pending/Cancelled orders excluded from consumption calculation
- Shortfall computation: verified below-threshold, at-threshold, and above-threshold cases
- Owner override with DB persistence: PATCH /api/inventory-items/{id}/threshold updates DB and returns updated model
- Validation: negative threshold rejected with 422
- Authentication: unauthenticated requests denied
- Authorization: non-owner roles denied via sanctum + role:owner middleware
- Suggested threshold rounding: ceiling function confirmed (errs toward over-provisioning)
- Ceil behavior: fractional daily averages round up to prevent under-provisioning

## Imports
- Laravel testing factories, traits, HTTP testing
- app/Enums/OrderStatus
- app/Models/InventoryItem, Order, MenuItem
