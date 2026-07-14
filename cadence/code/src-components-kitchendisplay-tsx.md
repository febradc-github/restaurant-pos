---
type: file
tags: [code/frontend]
aliases: ["src/components/KitchenDisplay.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-api-orders-ts]]", "[[src-realtime-echo-ts]]", "[[frontend-src-components-kitchenclocpad-tsx]]", "[[US-6]]", "[[US-12]]"]
sources: []
---

# src/components/KitchenDisplay.tsx

React component for kitchen staff to monitor and fulfill orders (C-6), plus clock in/out (C-12). No authentication token.

## Role

Fetches GET /api/orders?status=pending on every mount (reconnect-catch-up mechanism, independent of WebSocket state). Subscribes to kitchen channel via subscribeToKitchenChannel() for live order.placed/order.updated events. Displays pending orders and a "Mark ready" button for each. Drops orders from display once they're no longer pending. Also renders KitchenClockPad component as an independent overlay for PIN-based clock in/out.

## Pattern

The reconnect-catch-up fetch is always executed, regardless of WebSocket connectivity. This guarantees all orders are visible on each remount (e.g., browser reconnect). The WebSocket subscription then provides live updates as orders arrive and change status. If WebSocket is unavailable, the Kitchen Display degrades gracefully: refreshing the page re-fetches the list.

KitchenClockPad is rendered as a separate, non-blocking UI element (C-12). It does not interfere with order list fetching, WebSocket subscription, or the mark-ready logic. All pre-existing KitchenDisplay tests continue to pass unmodified; a new coexistence test verifies that both components render together.

## Styling

Paired CSS file (KitchenDisplay.css) included in src/components/.
