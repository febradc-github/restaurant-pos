---
type: spec
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-8]]", "[[DS-8]]"]
sources: []
---

# C-8: Local Print Agent & Hardware Integration -- Spec

## Acceptance criteria
- [ ] A local service runs and listens for print requests.
- [ ] On a print request, the service sends raw ESC/POS commands to print a formatted receipt.
- [ ] The same print job (or a dedicated command) triggers the cash drawer to open.
- [ ] The print agent surfaces an error to the Cashier if the printer is disconnected or unavailable, rather than failing silently.

## Out of scope
- Support for multiple simultaneous printers/drawers (single printer/drawer assumed for v1).
- Kitchen ticket printing (kitchen flow is screen-only, per [[DS-6]]).

## Reference
See [[DS-8]] for rationale and trade-offs.
