---
type: spec
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-6]]", "[[DS-6]]"]
sources: []
---

# C-6: Order Taking & Kitchen Display -- Spec

## Acceptance criteria
- [ ] Server can select a table and add menu items to an order, without logging in.
- [ ] Submitting an order writes it to the database and pushes it in real time (via Laravel Reverb) to the Kitchen Display.
- [ ] Kitchen Display shows incoming orders live, without polling or manual refresh.
- [ ] Kitchen can mark an order or order item as ready/done.
- [ ] If the Kitchen Display reconnects after a network drop, it fetches and displays any orders it missed.

## Out of scope
- Order modification after kitchen has started preparing it (not discussed).
- Course/timing sequencing (e.g. appetizers before mains) -- not requested.

## Reference
See [[DS-6]] for rationale and trade-offs.
