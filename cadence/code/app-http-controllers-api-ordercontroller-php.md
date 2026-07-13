---
type: file
tags: [code/backend]
aliases: ["app/Http/Controllers/Api/OrderController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-order-php]]", "[[app-events-orderplaced-php]]", "[[app-events-orderstatusupdated-php]]"]
sources: []
---

# app/Http/Controllers/Api/OrderController.php

API controller for order operations, no authentication required (Server/Kitchen device pattern from C-2).

## Exports
- `index()` -- GET /api/orders, optional `?status=` query filter (e.g. `?status=pending`), serves as reconnect-catch-up endpoint
- `store()` -- POST /api/orders, transactional creation of order + items, decrements inventory per C-5's contract using `quantity_required × ordered_quantity`, fires OrderPlaced event
- `markReady()` -- PATCH /api/orders/{order}/ready, marks entire order ready, fires OrderStatusUpdated event

## Design notes

- No authentication; any caller can place orders or change status (matches C-2's server/kitchen device assumption)
- Inventory decrement happens in store() via MenuItem's quantity tracking interface
- No partial-order-readiness support; order.markReady() is all-or-nothing (timing/sequencing out of scope for C-6)
