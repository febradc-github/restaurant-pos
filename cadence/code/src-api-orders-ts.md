---
type: file
tags: [code/frontend]
aliases: ["src/api/orders.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-types-order-ts]]", "[[src-api-menu-ts]]", "[[src-api-tables-ts]]", "[[src-components-ordertaking-tsx]]", "[[src-components-kitchendisplay-tsx]]", "[[US-6]]", "[[US-18]]", "[[US-19]]", "[[EP-14]]"]
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

## Used by
- [[src-components-ordertaking-tsx|src/components/OrderTaking.tsx]] -- create() call on form submission
- [[src-components-kitchendisplay-tsx|src/components/KitchenDisplay.tsx]] -- list(status='pending') on mount for reconnect-catch-up
