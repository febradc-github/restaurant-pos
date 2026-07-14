---
type: decision
tags: [backend, authentication]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-10]]", "[[DS-10]]", "[[AR-POS-core]]", "[[adr-007-sanctum-bearer-tokens]]"]
sources: []
---

# ADR-008: Server Login & Kitchen PIN-Based Attendance (Partial Reversal of "No Login" Architecture)

## Context

Early POS design ([[AR-POS-core]], C-1 era) made Server (waiter) and Kitchen device-level with no per-user login to avoid slowing down order-taking and kitchen-display visibility. Only Owner and Cashier authenticate via Sanctum bearer tokens ([[adr-007-sanctum-bearer-tokens]]).

C-10 ("Attendance & Extended RBAC", [[EP-10]]) now requires time-in/time-out attendance tracking across all staff for payroll and shift accountability. This creates pressure to reverse the "no login" constraint, but doing so uniformly would reintroduce the latency risk that motivated the original decision -- specifically, requiring Kitchen staff to log in before viewing live orders would slow down kitchen order visibility, the core bottleneck the original decision protected.

## Decision

Partially reverse the "no login" architecture for Server and Kitchen:

1. **Server gains real login:** Server now authenticates via the same Sanctum pattern as Cashier (email/PIN login, bearer token session). Login creates a `time_entries` row (`clock_in = now()`); logout sets `clock_out = now()`. No change to the intent of order-taking speed -- Server authenticates before entering the Take-Orders view, not on each interaction.

2. **Kitchen order display remains no-login:** The kitchen order display route stays public/unauthenticated, preserving the original decision's core intent: kitchen visibility must not be gated by a login step. This is the critical path for operational speed.

3. **Kitchen clock-in/out is PIN-based, not full auth:** Kitchen staff become real `UserRole::Kitchen` User records (enabling future role-gated API access). For attendance purposes only, they authenticate via a separate lightweight 6-digit PIN endpoint (not Sanctum email/password, not `auth:sanctum` middleware on the order display). The PIN endpoint issues no session token -- it only writes a `time_entries` row. A PIN-pad overlay on the kitchen display lets staff clock in/out without leaving the shared screen or requiring full authentication.

4. **Cashier's login is retrofitted to also record attendance:** Cashier's existing Sanctum login/logout (already built) now also writes/closes a `time_entries` row. No UI change; this is a side effect of the existing auth flow.

## Alternatives Considered

- **Full authentication for Kitchen (same as Server/Cashier):** Rejected because it would reintroduce the latency risk on kitchen order visibility that motivated the original "no login" design. A login gate before viewing live orders defeats the purpose of keeping kitchen displays responsive.

- **Leaving Kitchen fully device-level (no identity at all):** Rejected because payroll and shift accountability require linking time-in/time-out events to specific individuals. Device-level Staff with no identity cannot produce reliable attendance data.

- **Employee records instead of real User accounts for Server/Kitchen:** Rejected because reusing the existing Sanctum/`UserRole` infrastructure is simpler than maintaining a parallel identity model. Server needs full authentication anyway per the business decision; Kitchen's PIN system can coexist with a lightweight User record.

## Consequences

- **Positive:** Attendance tracking is now possible across all staff (Server, Cashier, Kitchen) with a unified data model (`time_entries` table). Server's authentication is consistent with Cashier. Kitchen's PIN system is lightweight and non-disruptive to the shared display flow.

- **Negative:** The architecture is now more complex: two authentication patterns (Sanctum for Owner/Cashier/Server, PIN for Kitchen). Operations teams must manage and rotate Kitchen PINs. Forgotten clock-outs require mitigation (auto-close job at daily cutoff, flagged for Owner review).

- **Enablers:** Foundational for future epics: Owner employee-management (registers User/role records), Owner analytics dashboard (surfaces `time_entries` as attendance/hours data), and role-gated API endpoints for Server and Kitchen.

## Related Decisions

- [[adr-007-sanctum-bearer-tokens]] -- Sanctum is the auth pattern for authenticated roles (Owner, Cashier, and now Server).
- [[AR-POS-core]] -- the core architecture note that recorded the original "no login" decision; now updated to reflect this partial reversal.
