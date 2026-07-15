---
type: file
tags: [code/frontend]
aliases: ["frontend/src/api/orders.ts"]
created: 2026-07-15
updated: 2026-07-16
related: ["[[frontend-src-types-order-ts]]", "[[frontend-src-components-checkout-tsx]]", "[[src-components-ordertaking-tsx]]", "[[src-components-kitchendisplay-tsx]]", "[[US-6]]", "[[US-18]]", "[[US-19]]", "[[EP-14]]"]
sources: []
---

# frontend/src/api/orders.ts

API client for order endpoints, mirrors tables.ts and menu.ts pattern (C-6).

## Exports
- `list(status?: OrderStatus)` -- GET /api/orders with optional status filter (reconnect-catch-up endpoint)
- `create(order: NewOrder)` -- POST /api/orders, returns created Order with id
- `markReady(orderId: number)` -- PATCH /api/orders/{orderId}/ready, marks order ready
- `checkout(orderId: number, method: PaymentMethod)` -- PATCH /api/orders/{orderId}/checkout, marks order paid
- `cancel(orderId: number)` -- DELETE /api/orders/{orderId}, cancels order

## Design

No authentication headers (server/kitchen device pattern). Status filter is optional, returns all orders if not specified. C-38 widened Checkout to call list() unfiltered (no status param) to support shift-summary stats requiring paid orders, then client-side filters to visibleOrders derivation.

## Used by
- [[frontend-src-components-checkout-tsx|frontend/src/components/Checkout.tsx]] -- list(), checkout(), cancel() (C-38: list() now unfiltered)
- [[src-components-ordertaking-tsx|src/components/OrderTaking.tsx]] -- create() call on form submission
- [[src-components-kitchendisplay-tsx|src/components/KitchenDisplay.tsx]] -- list(status='pending') on mount for reconnect-catch-up

## Testing

- frontend/src/api/orders.test.ts -- mock API responses with Orders fixture (C-38: fixture updated to include created_at field)
