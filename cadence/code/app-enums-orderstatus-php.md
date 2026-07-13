---
type: file
tags: [code/backend]
aliases: ["app/Enums/OrderStatus.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-order-php]]"]
sources: []
---

# app/Enums/OrderStatus.php

Enumeration for order states, deliberately minimal to support C-6 (Order Taking & Kitchen Display) without premature generalization.

## Exports
- `Pending` -- initial order state
- `Ready` -- order marked complete in kitchen; timing/sequencing out of scope for C-6

## Design rationale

Only two states for now. Partial-order readiness (mark individual items as ready) and delivery-to-table sequencing are not included; they're flagged as future work if needed. Current model: an order becomes ready as a whole when the kitchen marks it so.
