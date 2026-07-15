---
type: domain
tags: [backend, frontend, ui-redesign]
aliases: []
created: 2026-07-16
updated: 2026-07-16
related: ["[[US-37]]", "[[SP-37]]", "[[DS-37]]"]
sources: []
---

# C-37: Scope Amendment – Reserved State and Booking System Deferred

During C-37 implementation, the original spec (SP-37) called for three table-status colors: available/occupied/reserved. During a design clarification with the product owner, the question of "how should reserved tables be represented and managed?" surfaced the fact that **no reservation data model exists anywhere in this codebase yet** — no Customer table, no Reservations table, no booking calendar, no date/time/party-size schema.

Rather than invent the entire booking-system foundation out of C-37's scope, the decision was:

1. **Ship C-37 with two colors only** (available in green, occupied in red) — the core floor-plan UI is complete and matches the current state model.
2. **Defer the full reservation system** to a future story (planned under [[EP-35]]) to be spec'd and implemented as a separate initiative with proper schema design, calendar UI, and auto-expiry logic.

Both SP-37.md and DS-37.md were amended in place with explicit "Amended during implementation" notes. Codebase readers will not confuse the two-color shipped state with an incomplete three-color implementation.

## Implications

- Frontend `TableLayoutEditor.tsx` has an explicit comment explaining why there's no third "reserved" state (lines 82-86)
- The occupancy logic (available/occupied) is centralized and server-derived; adding a third state later will require schema changes and a new relation, not just a UI tweak
- No click-trap: "reserved" does not appear anywhere in the shipped code
