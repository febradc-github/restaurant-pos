---
type: file
tags: [code/backend]
aliases: ["app/Events/OrderPlaced.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-events-orderstatusupdated-php]]", "[[app-http-controllers-api-ordercontroller-php]]"]
sources: []
---

# app/Events/OrderPlaced.php

Broadcastable event fired when an order is created (C-6).

## Exports
- `broadcastAs()` -- returns `'order.placed'` (note: client-side listeners must use `'.order.placed'` with leading dot; see [[laravel-reverb-broadcastas-dot-prefix-gotcha]])

## Broadcast

- Channel: public `Channel('kitchen')`
- Includes order data for real-time delivery to KitchenDisplay
