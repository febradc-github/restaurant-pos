---
type: file
tags: [code/frontend]
aliases: ["src/api/orders.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-types-order-ts]]", "[[src-api-menu-ts]]", "[[src-api-tables-ts]]"]
sources: []
---

# src/api/orders.ts

API client for order endpoints, mirrors tables.ts and menu.ts pattern (C-6).

## Exports
- `list(status?: OrderStatus)` -- GET /api/orders with optional status filter (reconnect-catch-up endpoint)
- `create(order: NewOrder)` -- POST /api/orders, returns created Order with id
- `markReady(orderId: number)` -- PATCH /api/orders/{orderId}/ready, marks order ready

## Design

No authentication headers (server/kitchen device pattern). Status filter is optional, returns all orders if not specified.
