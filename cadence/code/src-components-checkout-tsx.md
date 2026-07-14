---
type: file
tags: [code/frontend]
aliases: ["src/components/Checkout.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-checkout-css]]", "[[src-components-checkout-test-tsx]]", "[[src-components-cashierpage-tsx]]", "[[src-api-orders-ts]]", "[[src-types-checkout-ts]]", "[[src-types-order-ts]]", "[[antd-radio-button-pointer-events-gotcha]]", "[[antd-v6-space-component-deprecation]]", "[[US-7]]", "[[US-17]]"]
sources: []
---

# src/components/Checkout.tsx

Fully rebuilt cashier-facing checkout UI with Ant Design. Fetches open orders via GET /api/orders, client-side filtering to pending/ready status (since backend status query param accepts one value at a time). Responsive Row/Col grid of Cards (one per order: xs=24 md=12 lg=8), with order details and per-order controls. All existing API interaction points preserved (api.list() filtering, api.checkout(order.id, method), api.cancel(order.id)) and per-order state tracking (payment method choice, print status) unchanged. Typography.Title level={4} labels the card grid. 

Payment method selector now a Radio.Group optionType="button" (button-style radios for faster tap selection among 3 methods) instead of dropdown. Full-width primary Button "Confirm payment" and visually subordinate Button danger type="text" size="small" "Cancel order" spaced below (deliberately not equal visual weight). Paid state rendered as Tag icon={CheckCircleOutlined} color="success" role="status" reading "Paid" (icon+text, not color-only). Print-failure state now Alert type="warning" showIcon (deliberately warning, not error, since payment succeeded)—kept visually/semantically distinct from Alert type="error" for genuine fetch/action failures. Mirrors auth token gating pattern from original (no token = no controls rendered).

## Exports
- `Checkout(props: {authToken: string, apiBaseUrl: string})` -- cashier checkout interface

## Imports
- [[src-api-orders-ts|src/api/orders.ts]] -- api.list(), api.checkout(), api.cancel()
- [[src-types-checkout-ts|src/types/checkout.ts]] -- PaymentMethod, PrintStatus, CheckoutResult types
- [[src-types-order-ts|src/types/order.ts]] -- Order, OrderStatus types
- [[src-components-checkout-css|src/components/Checkout.css]] -- styling
- `antd` -- Card, Row, Col, Button, Radio, Tag, Alert, Typography, CheckCircleOutlined icon
- `react` -- hooks, JSX, useState

## Used by
- [[src-components-cashierpage-tsx|src/components/CashierPage.tsx]] -- rendered as main feature
