---
type: spec
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-7]]", "[[DS-7]]"]
sources: []
---

# C-7: Checkout, Payment Confirmation & Cancellation -- Spec

## Acceptance criteria
- [ ] Cashier can view an open order/table and initiate checkout.
- [ ] Cashier selects a payment method: cash, QR Ph, or GCash.
- [ ] Cashier confirms payment received, which marks the order as paid.
- [ ] Cashier can cancel an order, removing it from active orders.
- [ ] A paid order triggers receipt generation, handed off to the print agent (C-8) for physical printing.

## Out of scope
- Live payment gateway API integration (deliberately deferred, per [[adr-005-manual-payment-confirmation]]).
- Split bills / partial payments (not discussed).
- Tipping/gratuity handling.

## Reference
See [[DS-7]] for rationale and trade-offs.
