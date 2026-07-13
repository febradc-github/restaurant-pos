---
type: file
tags: [code/backend]
aliases: ["tests/Feature/Orders/OrderTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-http-controllers-api-ordercontroller-php]]"]
sources: []
---

# tests/Feature/Orders/OrderTest.php

Feature tests for order operations (C-6), 9 tests total exercising all acceptance criteria.

## Coverage

- Order creation via POST /api/orders (transactional, inventory decrement verification)
- Order status retrieval via GET /api/orders (with and without ?status= filter)
- Order status transition via PATCH /api/orders/{order}/ready
- Event broadcasts (OrderPlaced, OrderStatusUpdated) verified via fake broadcasting
- Inventory decrement on order creation (per C-5 contract)
- Edge cases: missing tables, invalid menu items, zero quantity
