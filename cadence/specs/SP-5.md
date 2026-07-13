---
type: spec
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-5]]", "[[DS-5]]"]
sources: []
---

# C-5: Inventory Tracking -- Spec

## Acceptance criteria
- [ ] Owner can set and adjust stock levels for inventory-tracked items.
- [ ] Menu items can be linked to one or more inventory items.
- [ ] When linked stock reaches zero, the corresponding menu item is automatically flagged unavailable.
- [ ] Stock levels decrease as orders are placed.

## Out of scope
- Purchase-order / supplier tracking.
- Low-stock alerting/notifications (only the zero-stock auto-unavailable behavior is in scope).

## Reference
See [[DS-5]] for rationale and trade-offs.
