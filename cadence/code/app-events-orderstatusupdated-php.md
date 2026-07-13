---
type: file
tags: [code/backend]
aliases: ["app/Events/OrderStatusUpdated.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-events-orderplaced-php]]", "[[app-http-controllers-api-ordercontroller-php]]"]
sources: []
---

# app/Events/OrderStatusUpdated.php

Broadcastable event fired when an order status is changed (e.g., marked ready in C-6).

## Exports
- `broadcastAs()` -- returns `'order.updated'` (note: client-side listeners must use `'.order.updated'` with leading dot; see [[laravel-reverb-broadcastas-dot-prefix-gotcha]])

## Broadcast

- Channel: public `Channel('kitchen')`
- Fired from OrderController::markReady()
