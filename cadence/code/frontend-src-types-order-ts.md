---
type: file
tags: [code/frontend]
aliases: ["frontend/src/types/order.ts"]
created: 2026-07-15
updated: 2026-07-16
related: ["[[frontend-src-api-orders-ts]]", "[[frontend-src-components-checkout-tsx]]", "[[frontend-src-components-ordertaking-tsx]]", "[[US-39]]"]
sources: []
---

# frontend/src/types/order.ts

TypeScript type definitions for orders, mirroring the backend Order/OrderItem models (C-6).

## Exports
- `OrderStatus` -- union type ('pending' | 'ready') matching backend enum
- `OrderLineItem` -- a line item within an order (menu_item_id, quantity, notes: string | null [C-39])
- `Order` -- complete order (id, table_id, status, items: OrderLineItem[], created_at: string) [C-38: added created_at]
- `NewOrder` -- payload for creating an order (table_id, items: NewOrderItem[])
- `NewOrderItem` -- line item in create payload (menu_item_id, quantity, notes?: string [C-39])

## Pattern

Follows the same convention as tables.ts and menu.ts: matches backend structure, splits create payloads from response types.

## Notes

**created_at field (C-38)**: Added to Order type. Required no backend change — Eloquent's default toArray() already includes created_at/updated_at timestamps since Order.php has no $hidden/$visible restricting them. Field was already being sent over the wire; this was a TypeScript type sync only.

**notes field (C-39)**: OrderLineItem.notes is a persisted nullable string (server-returned). NewOrderItem.notes is optional in submissions (users may leave the kitchen-note textarea blank). The spec required notes to live on order_items, but the Server UI submits a single order-level note that gets copied onto every line item (see [[frontend-src-components-ordertaking-tsx|OrderTaking.tsx]] implementation). This means all items in an order will carry the same note text (or all null), even though the schema allows independent per-item values — any future feature reading kitchen notes needs to account for this modeling choice.
