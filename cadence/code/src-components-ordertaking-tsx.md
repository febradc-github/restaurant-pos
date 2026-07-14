---
type: file
tags: [code/frontend]
aliases: ["src/components/OrderTaking.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-ordertaking-css]]", "[[src-components-ordertaking-test-tsx]]", "[[src-components-takeorderspage-tsx]]", "[[src-api-orders-ts]]", "[[src-types-order-ts]]", "[[US-18]]", "[[EP-14]]"]
sources: []
---

# src/components/OrderTaking.tsx

React component for servers to create and place orders (C-6, fully rebuilt C-18). No authentication token. Rebuilt with Ant Design: searchable large Select for table choice, quantity stepper for each item (+/- Buttons flanking InputNumber in Space.Compact), full-width primary Button submit with loading state, success/error Alert feedback. Preserves every original behavior: fetch-on-mount, available-only filtering, quantity state model (delete key on zero, not store zero), table+at-least-one-item validation, ordersApi.create({table_id, items}) payload, confirmation message, form reset on success.

## Exports
- `OrderTaking()` -- server order-entry component

## Imports
- [[src-components-ordertaking-css|src/components/OrderTaking.css]] -- styling
- [[src-api-orders-ts|src/api/orders.ts]] -- ordersApi.create()
- [[src-api-tables-ts|src/api/tables.ts]] -- tablesApi.getAll()
- [[src-api-menu-ts|src/api/menu.ts]] -- menuApi.getAll()
- [[src-types-order-ts|src/types/order.ts]] -- Order, OrderItem types
- `antd` -- Select, Button, InputNumber, Space, Alert, Card, Spin
- `react` -- useState, useEffect

## Used by
- [[src-components-takeorderspage-tsx|src/components/TakeOrdersPage.tsx]] -- wrapped in page shell
- (legacy) [[src-app-tsx|src/App.tsx]] -- formerly mounted directly at `/take-orders`
