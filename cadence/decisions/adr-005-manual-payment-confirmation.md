---
type: decision
tags: [payment]
aliases: ["Payment processing", "QR Ph integration", "Manual checkout"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-1]]", "[[AR-POS-core]]", "[[pos-launch-session-2026-07-14]]"]
---

# ADR-005: Manual Payment Confirmation in v1, Not Live Gateway Integration

**Decision:** v1 checkout uses manual payment confirmation (cashier confirms receipt of cash/QR Ph/GCash payment); defer live payment gateway API integration to a future release.

## Context

The restaurant accepts cash, QR Ph (Philippine QR code payment), and GCash (Philippine e-wallet). A live payment gateway integration (PayMongo, Xendit, etc.) was considered for v1 but deferred.

## Rationale

**Merchant onboarding timeline risk:** Integrating with a live payment aggregator requires merchant KYC (Know Your Customer), bank verification, contract negotiation, and API credentials. This work is controlled by the payment processor, not the dev team, and can take weeks or be rejected. Using it as a blocker for v1 launch adds uncontrollable risk.

**Simpler v1 scope:** Manual confirmation is sufficient for launch. Cashier takes payment (outside the system), then confirms receipt in the app. Works for cash, QR Ph scans (customer scans, cashier confirms), and GCash transfers. No API latency, no failed transaction handling, no PCI compliance scope.

**Clean upgrade path:** The payment step is deliberately architected as a distinct unit (POST /checkout/payment-confirmation with a payment-method enum). When a live QR Ph API is ready later, swapping out manual confirmation for real-time validation requires changes only within that unit. Rest of checkout logic is untouched.

**Product strategy:** The client wants to launch soon and prove the business case. Live payments are a nice-to-have for v1.1 or v2, not a launch blocker.

## Alternatives Rejected

**Live payment gateway (PayMongo/Xendit API in v1):** Better UX (no manual confirmation), but adds merchant onboarding risk (outside dev control), PCI compliance considerations, and higher v1 complexity. The incremental benefit for a newly opening restaurant is not worth the risk.

## Revisit Trigger

Once merchant onboarding is complete and the customer is live and stable, upgrade to live QR Ph or GCash API in a maintenance release.
