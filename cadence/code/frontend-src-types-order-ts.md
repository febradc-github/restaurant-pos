---
type: file
tags: [code/frontend]
aliases: ["frontend/src/types/order.ts"]
created: 2026-07-15
updated: 2026-07-16
related: ["[[frontend-src-api-orders-ts]]", "[[frontend-src-components-checkout-tsx]]"]
sources: []
---

# frontend/src/types/order.ts

TypeScript type definitions for orders, mirroring the backend Order/OrderItem models (C-6).

## Exports
- `OrderStatus` -- union type ('pending' | 'ready') matching backend enum
- `OrderLineItem` -- a line item within an order (menu_item_id, quantity)
- `Order` -- complete order (id, table_id, status, items: OrderLineItem[], created_at: string) [C-38: added created_at]
- `NewOrder` -- payload for creating an order (table_id, items: NewOrderItem[])
- `NewOrderItem` -- line item in create payload (menu_item_id, quantity)

## Pattern

Follows the same convention as tables.ts and menu.ts: matches backend structure, splits create payloads from response types.

## Notes

**created_at field (C-38)**: Added to Order type. Required no backend change — Eloquent's default toArray() already includes created_at/updated_at timestamps since Order.php has no $hidden/$visible restricting them. Field was already being sent over the wire; this was a TypeScript type sync only.
