---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/Checkout.tsx"]
created: 2026-07-15
updated: 2026-07-16
related: ["[[frontend-src-components-checkout-css]]", "[[frontend-src-components-checkout-test-tsx]]", "[[frontend-src-utils-currency-ts]]", "[[frontend-src-components-checkouthelpers-ts]]", "[[frontend-src-types-order-ts]]", "[[frontend-src-api-orders-ts]]", "[[src-components-checkout-tsx]]", "[[src-components-cashierpage-tsx]]", "[[US-38]]"]
sources: []
---

# frontend/src/components/Checkout.tsx

Major C-38 redesign of the cashier checkout UI. Fetches all orders via GET /api/orders (widened from open-orders-only to support shift-summary stats requiring paid orders), with client-side filtering to visibleOrders derivation that renders open orders and briefly holds just-confirmed orders visible for print-failure alert/paid-tag rendering before removing them.

Per-order card displays: order number (`#{id}`), elapsed time since created_at via helper, right-aligned per-line-item prices formatted via the new shared ₱ currency formatter, total footer, "Confirm payment ₱X.XX" button label (kept word "payment" to preserve test queries), Cancel button as quiet type="text" danger (still wrapped in existing Popconfirm with busy-state from C-32).

Line-item truncation at 5-item threshold (LINE_ITEM_PREVIEW_COUNT from checkoutHelpers): shows "+N more items" / "Show less" expand toggle. Shift-summary header via antd Statistic cards: open order count (from visibleOrders), pending total (unpaid orders summed via orderTotal helper), paid-today (orders from today with paid status via isOrderFromToday check).

Search input filters by table label or line-item menu-item name (case-insensitive). Sort control toggles by created_at oldest/newest via sortByCreatedAt helper. All helpers are pure (no React state) extracted from this component.

Payment method selector unchanged from C-32 (Radio.Group optionType="button" with size="large" touch targets). All API interaction points unchanged (api.list() filtering, api.checkout(), api.cancel()). Per-order state tracking unchanged (pendingOrderId/pendingAction from C-32, print-status tracking).

## Exports
- `Checkout(props: {authToken: string, apiBaseUrl: string})` -- cashier checkout interface

## Imports
- [[frontend-src-components-checkouthelpers-ts|frontend/src/components/checkoutHelpers.ts]] -- elapsedTimeSinceCreatedAt, isOrderFromToday, searchPredicate, sortByCreatedAt, orderTotal, LINE_ITEM_PREVIEW_COUNT
- [[frontend-src-utils-currency-ts|frontend/src/utils/currency.ts]] -- formatCurrency (₱ formatter)
- [[frontend-src-types-order-ts|frontend/src/types/order.ts]] -- Order, OrderStatus
- [[frontend-src-api-orders-ts|frontend/src/api/orders.ts]] -- api.list(), api.checkout(), api.cancel()
- [[frontend-src-components-checkout-css|frontend/src/components/Checkout.css]] -- styling
- `antd` -- Card, Row, Col, Button, Radio, Tag, Alert, Typography, Popconfirm, Spin, Statistic, Input, Select, CheckCircleOutlined icon
- `react` -- hooks, JSX, useState, useMemo

## Used by
- [[src-components-cashierpage-tsx|src/components/CashierPage.tsx]] -- rendered as main feature

## History
- **C-32 (2026-07-15)**: Added touch-target sizing, per-order pending-state tracking, destructive-action confirmation
- **C-38 (2026-07-16)**: Full redesign with elapsed time, order numbers, truncation, shift summary, search, sort, new shared currency & helper utils
