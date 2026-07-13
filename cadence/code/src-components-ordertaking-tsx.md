---
type: file
tags: [code/frontend]
aliases: ["src/components/OrderTaking.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-api-orders-ts]]", "[[src-types-order-ts]]"]
sources: []
---

# src/components/OrderTaking.tsx

React component for servers to create and place orders (C-6). No authentication token.

## Role

Renders a server-facing order entry interface: table selector dropdown + per-item quantity inputs (filtered to available menu items). Submit button calls ordersApi.create(), confirms/resets the form on success.

## Design

No auth token anywhere. Quantities start at zero, only non-zero items are sent to the backend. Simple one-page flow: no cart persistence, no draft orders.

## Styling

Paired CSS file (OrderTaking.css) included in src/components/.
