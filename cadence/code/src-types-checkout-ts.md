---
type: file
tags: [code/frontend]
aliases: ["src/types/checkout.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-checkout-tsx]]", "[[src-api-orders-ts]]", "[[src-types-order-ts]]"]
sources: []
---

# src/types/checkout.ts

Checkout UI types: PaymentMethod ('cash'|'qr_ph'|'gcash'), PrintStatus ('printed'|'failed'), CheckoutResult ({order, print_status}).

## Exports
- `type PaymentMethod` -- payment method union
- `type PrintStatus` -- receipt print outcome union
- `type CheckoutResult` -- checkout response shape

## Used by
- [[src-components-checkout-tsx|src/components/Checkout.tsx]] -- payment/status UI
- [[src-api-orders-ts|src/api/orders.ts]] -- checkout() response type
