---
type: file
tags: [code/frontend]
aliases: ["src/components/Checkout.tsx"]
created: 2026-07-14
updated: 2026-07-15
related: ["[[src-components-checkout-css]]", "[[src-components-checkout-test-tsx]]", "[[src-components-cashierpage-tsx]]", "[[src-api-orders-ts]]", "[[src-types-checkout-ts]]", "[[src-types-order-ts]]", "[[antd-radio-button-pointer-events-gotcha]]", "[[antd-v6-space-component-deprecation]]", "[[owner-console-ui-audit-learnings]]", "[[epic-c28-per-item-pending-state-scoping-patterns]]", "[[US-7]]", "[[US-17]]", "[[US-32]]"]
sources: []
---

# src/components/Checkout.tsx

Fully rebuilt cashier-facing checkout UI with Ant Design. Fetches open orders via GET /api/orders, client-side filtering to pending/ready status (since backend status query param accepts one value at a time). Responsive Row/Col grid of Cards (one per order: xs=24 md=12 lg=8), with order details and per-order controls. All existing API interaction points preserved (api.list() filtering, api.checkout(order.id, method), api.cancel(order.id)) and per-order state tracking (payment method choice, print status) unchanged. Typography.Title level={4} labels the card grid.

Payment method selector now a Radio.Group optionType="button" (button-style radios for faster tap selection among 3 methods) instead of dropdown. Full-width primary Button "Confirm payment" and visually subordinate Button danger type="text" size="small" "Cancel order" spaced below (deliberately not equal visual weight). Paid state rendered as Tag icon={CheckCircleOutlined} color="success" role="status" reading "Paid" (icon+text, not color-only). Print-failure state now Alert type="warning" showIcon (deliberately warning, not error, since payment succeeded)—kept visually/semantically distinct from Alert type="error" for genuine fetch/action failures. Mirrors auth token gating pattern from original (no token = no controls rendered).

## C-32 Fixes

Three fixes added during C-32 audit (Cashier & Take-Orders UI Audit & Fixes):

1. **Touch-target sizing**: Added `size="large"` to both "Confirm payment" Button and payment-method Radio.Group to match the app's established frontline-screen touch-target convention (44px minimum, see [[owner-console-ui-audit-learnings]]). This matches OrderTaking, KitchenClockPad, KitchenDisplay, and Login post-C-30 standards.

2. **Per-order pending state tracking**: Added `pendingOrderId` and `pendingAction` state variables to track async operations per specific order. When a Confirm or Cancel request is in flight for a particular order, only that order's controls (Confirm button, Cancel button, payment-method Radio.Group) disable and show loading spinner. Prevents accidental double-submission and duplicate charges. See [[epic-c28-per-item-pending-state-scoping-patterns]] for the design framework: this is same-item mutual exclusion (deliberately different from KitchenDisplay's cross-item independence).

3. **Destructive action confirmation**: Wrapped "Cancel order" Button in antd `Popconfirm` modal ("Cancel this order?"/"Yes, cancel"/"No") since it previously fired immediately with no confirmation despite being a destructive action against an active order. Mirrors the existing Deactivate-employee Popconfirm pattern in [[frontend-src-components-EmployeeManager-tsx|EmployeeManager.tsx]].

## Exports
- `Checkout(props: {authToken: string, apiBaseUrl: string})` -- cashier checkout interface

## Imports
- [[src-api-orders-ts|src/api/orders.ts]] -- api.list(), api.checkout(), api.cancel()
- [[src-types-checkout-ts|src/types/checkout.ts]] -- PaymentMethod, PrintStatus, CheckoutResult types
- [[src-types-order-ts|src/types/order.ts]] -- Order, OrderStatus types
- [[src-components-checkout-css|src/components/Checkout.css]] -- styling
- `antd` -- Card, Row, Col, Button, Radio, Tag, Alert, Typography, Popconfirm, Spin, CheckCircleOutlined icon
- `react` -- hooks, JSX, useState

## Used by
- [[src-components-cashierpage-tsx|src/components/CashierPage.tsx]] -- rendered as main feature
