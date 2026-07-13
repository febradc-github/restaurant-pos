---
type: file
tags: [code/frontend]
aliases: ["src/components/Checkout.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-api-orders-ts]]", "[[src-types-checkout-ts]]", "[[src-types-order-ts]]", "[[src-app-tsx]]", "[[US-7]]"]
sources: []
---

# src/components/Checkout.tsx

Cashier-facing checkout UI: fetches all orders via GET /api/orders, filters client-side to pending/ready status (backend status query param accepts one value at a time, so client-side combine is cleaner). Payment method selector + confirm button per order. Displays print_status:'failed' as distinct warning from success. Cancel button per order. Mirrors owner-gating pattern from TableLayoutEditor/MenuManager (no auth token means no rendered controls).

## Exports
- `Checkout(props: {authToken: string})` -- cashier checkout interface

## Imports
- [[src-api-orders-ts|src/api/orders.ts]] -- uses checkout(), cancel(), all orders list
- [[src-types-checkout-ts|src/types/checkout.ts]] -- PaymentMethod, PrintStatus, CheckoutResult types
- [[src-types-order-ts|src/types/order.ts]] -- Order, OrderStatus types
- `react` -- hooks, JSX
- `react-query` or similar -- data fetching

## Used by
- [[src-app-tsx|src/App.tsx]] -- renders when logged in as cashier
