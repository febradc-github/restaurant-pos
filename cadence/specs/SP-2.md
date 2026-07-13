---
type: spec
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-2]]", "[[DS-2]]"]
sources: []
---

# C-2: Authentication & Role-Based Access -- Spec

## Acceptance criteria
- [ ] Owner and Cashier can log in with an identifier (e.g. email or username) and password.
- [ ] Owner and Cashier are modeled as distinct roles with separate, API-level-enforced permission sets (an Owner-only endpoint rejects a Cashier token and vice versa).
- [ ] Server and Kitchen require no login and are not modeled as authenticated users at all -- the API supports routes with no auth middleware at all, proving the routing/middleware model accommodates device-level, no-login access alongside authenticated, role-gated access. Server's and Kitchen's own distinct endpoints are built in their respective tickets ([[US-6]] for Server/order-taking, later tickets for Kitchen-specific actions), not here.
- [ ] An unauthenticated or wrong-role request to an Owner-only or Cashier-only endpoint is rejected by the backend (not just hidden in the UI).
- [ ] Owner and Cashier sessions persist for a reasonable working session.

## Out of scope
- Exact session duration/expiry policy (confirmed during implementation, not blocking).
- Password reset / forgot-password flow (not discussed; revisit if needed before launch).
- Multi-factor authentication.
- Any dedicated Server or Kitchen role/identity model -- by design (see [[DS-2]]), these are unauthenticated device-level views, not distinct API-level roles.

## Reference
See [[DS-2]] for rationale and trade-offs.
