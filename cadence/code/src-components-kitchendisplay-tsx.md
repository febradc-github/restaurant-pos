---
type: file
tags: [code/frontend]
aliases: ["src/components/KitchenDisplay.tsx"]
created: 2026-07-14
updated: 2026-07-15
related: ["[[src-components-kitchendisplay-css]]", "[[src-api-orders-ts]]", "[[src-realtime-echo-ts]]", "[[src-components-kitchenclockpad-tsx]]", "[[src-components-kitchenpage-tsx]]", "[[US-6]]", "[[US-12]]", "[[US-19]]", "[[US-33]]", "[[EP-14]]", "[[EP-28]]"]
sources: []
---

# src/components/KitchenDisplay.tsx

React component for kitchen staff to monitor and fulfill orders (C-6), plus clock in/out (C-12). Rebuilt with Ant Design (C-19). No authentication token. Displays pending orders on a wall-mounted/counter display—designed for at-a-distance legibility in a bright, busy kitchen.

## Role

Fetches GET /api/orders?status=pending on every mount (reconnect-catch-up mechanism, independent of WebSocket state). Subscribes to kitchen channel via `subscribeToKitchenChannel()` for live order.placed/order.updated events. Displays pending orders in a Row/Col grid of large Cards (one per order), each with deliberately larger padding and type than checkout/order-taking cards—optimized for readability from a few feet away. Each order card shows order details and a "Mark ready" Button. Uses Ant Design `Typography.Title` for headings/table labels, `Alert` for errors, `Tag` for order status, `Button size="large" block` for "Mark ready". Drops orders from display once they're no longer pending. Also renders KitchenClockPad component as an independent overlay for PIN-based clock in/out.

## Pattern

The reconnect-catch-up fetch is always executed, regardless of WebSocket connectivity. This guarantees all orders are visible on each remount (e.g., browser reconnect). The WebSocket subscription then provides live updates as orders arrive and change status. If WebSocket is unavailable, the Kitchen Display degrades gracefully: refreshing the page re-fetches the list.

The `upsertPendingOrder` helper and `handleMarkReady` handler are completely unchanged from pre-Ant Design implementation. All 8 pre-existing tests pass unmodified against the new markup, confirming the interaction logic itself was untouched.

KitchenClockPad is rendered as a separate, non-blocking UI element (C-12). It does not interfere with order list fetching, WebSocket subscription, or the mark-ready logic. All pre-existing KitchenDisplay tests continue to pass unmodified; a new coexistence test verifies that both components render together.

## C-33 Fixes

C-33 (Kitchen UI Audit & Fixes) added one substantive fix:

**Per-order pending state tracking and scoped loading feedback**: Added `markingReadyId` state variable to track which order's mark-ready action is currently in flight. When a mark-ready request is submitted for a specific order, only that order's "Mark ready" Button shows `loading={true}` and disables. Critically: other orders' "Mark ready" buttons remain enabled and clickable — this is a deliberate divergence from C-32's Checkout pattern (see [[epic-c28-per-item-pending-state-scoping-patterns]] for the full design rationale). Kitchen throughput during a busy service is prioritized: staff should never be blocked from marking a different order ready while another order's async action is in flight. The `markingReadyId` is set at the start of `handleMarkReady` and cleared in a `finally` block to guarantee cleanup even if the request fails.

A new test "shows loading feedback on the specific order being marked ready, without disabling other orders" verifies the fix (test fails before the change, passes after).

No confirmation dialog before "Mark ready" (unlike C-32's "Cancel order" Popconfirm): marking an order ready is a normal workflow advance under time pressure, not a destructive/hard-to-reverse action. The at-speed kitchen design intent explicitly rejects confirmation-per-tap.

## Styling

Paired CSS file (KitchenDisplay.css) included in src/components/. Ant Design cards with intentionally large padding and font sizes for distance readability.

## Exports
- `KitchenDisplay()` -- kitchen order display and mark-ready interface

## Imports
- [[src-api-orders-ts|src/api/orders.ts]] -- GET /api/orders
- [[src-realtime-echo-ts|src/realtime/echo.ts]] -- subscribeToKitchenChannel
- [[src-components-kitchenclockpad-tsx|src/components/KitchenClockPad.tsx]] -- PIN-based clock in/out overlay
- `antd` -- Typography.Title, Alert, Row, Col, Card, Tag, Button
- `react` -- hooks

## Used by
- [[src-components-kitchenpage-tsx|src/components/KitchenPage.tsx]] -- rendered as main feature
