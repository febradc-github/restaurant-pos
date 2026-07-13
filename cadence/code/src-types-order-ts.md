---
type: file
tags: [code/frontend]
aliases: ["src/types/order.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-api-orders-ts]]"]
sources: []
---

# src/types/order.ts

TypeScript type definitions for orders, mirroring the backend Order/OrderItem models (C-6).

## Exports
- `OrderStatus` -- union type ('pending' | 'ready') matching backend enum
- `OrderLineItem` -- a line item within an order (menu_item_id, quantity)
- `Order` -- complete order (id, table_id, status, items: OrderLineItem[])
- `NewOrder` -- payload for creating an order (table_id, items: NewOrderItem[])
- `NewOrderItem` -- line item in create payload (menu_item_id, quantity)

## Pattern

Follows the same convention as tables.ts and menu.ts: matches backend structure, splits create payloads from response types.
