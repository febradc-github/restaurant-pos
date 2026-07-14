---
type: file
tags: [code/frontend]
aliases: ["src/components/KitchenDisplay.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-kitchendisplay-css]]", "[[src-api-orders-ts]]", "[[src-realtime-echo-ts]]", "[[src-components-kitchenclockpad-tsx]]", "[[src-components-kitchenpage-tsx]]", "[[US-6]]", "[[US-12]]", "[[US-19]]", "[[EP-14]]"]
sources: []
---

# src/components/KitchenDisplay.tsx

React component for kitchen staff to monitor and fulfill orders (C-6), plus clock in/out (C-12). Rebuilt with Ant Design (C-19). No authentication token. Displays pending orders on a wall-mounted/counter display—designed for at-a-distance legibility in a bright, busy kitchen.

## Role

Fetches GET /api/orders?status=pending on every mount (reconnect-catch-up mechanism, independent of WebSocket state). Subscribes to kitchen channel via `subscribeToKitchenChannel()` for live order.placed/order.updated events. Displays pending orders in a Row/Col grid of large Cards (one per order), each with deliberately larger padding and type than checkout/order-taking cards—optimized for readability from a few feet away. Each order card shows order details and a "Mark ready" button. Uses Ant Design `Typography.Title` for headings/table labels, `Alert` for errors, `Tag` for order status, `Button size="large" block` for "Mark ready". Drops orders from display once they're no longer pending. Also renders KitchenClockPad component as an independent overlay for PIN-based clock in/out.

## Pattern

The reconnect-catch-up fetch is always executed, regardless of WebSocket connectivity. This guarantees all orders are visible on each remount (e.g., browser reconnect). The WebSocket subscription then provides live updates as orders arrive and change status. If WebSocket is unavailable, the Kitchen Display degrades gracefully: refreshing the page re-fetches the list.

The `upsertPendingOrder` helper and `handleMarkReady` handler are completely unchanged from pre-Ant Design implementation. All 8 pre-existing tests pass unmodified against the new markup, confirming the interaction logic itself was untouched.

KitchenClockPad is rendered as a separate, non-blocking UI element (C-12). It does not interfere with order list fetching, WebSocket subscription, or the mark-ready logic. All pre-existing KitchenDisplay tests continue to pass unmodified; a new coexistence test verifies that both components render together.

## Styling

Paired CSS file (KitchenDisplay.css) included in src/components/. Ant Design cards with intentionally large padding and font sizes for distance readability.

## Imports
- [[src-api-orders-ts|src/api/orders.ts]] -- GET /api/orders
- [[src-realtime-echo-ts|src/realtime/echo.ts]] -- subscribeToKitchenChannel
- [[src-components-kitchenclockpad-tsx|src/components/KitchenClockPad.tsx]] -- PIN-based clock in/out overlay
- `antd` -- Typography.Title, Alert, Row, Col, Card, Tag, Button
- `react` -- hooks
