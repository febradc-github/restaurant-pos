---
type: file
tags: [code/backend]
aliases: ["app/Enums/OrderStatus.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-order-php]]", "[[app-http-controllers-api-ordercontroller-php]]", "[[app-services-checkout-paymentconfirmationservice-php]]", "[[US-6]]", "[[US-7]]"]
sources: []
---

# app/Enums/OrderStatus.php

Enumeration for order states.

## Exports
- `Pending` -- initial order state (C-6)
- `Ready` -- order marked complete in kitchen (C-6)
- `Paid` -- payment confirmed and captured (C-7)
- `Cancelled` -- order cancelled by cashier (C-7)

## Design rationale

C-6 introduced Pending and Ready. C-7 added Paid and Cancelled to support checkout flow. Partial-order readiness (mark individual items as ready) and delivery-to-table sequencing are out of scope.
