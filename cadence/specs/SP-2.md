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
- [ ] Server and Kitchen views are accessible without login.
- [ ] Each of the four roles (Owner, Cashier, Server, Kitchen) has a distinct permission set enforced at the API level.
- [ ] An unauthenticated or wrong-role request to an Owner-only or Cashier-only endpoint is rejected by the backend (not just hidden in the UI).
- [ ] Owner and Cashier sessions persist for a reasonable working session.

## Out of scope
- Exact session duration/expiry policy (confirmed during implementation, not blocking).
- Password reset / forgot-password flow (not discussed; revisit if needed before launch).
- Multi-factor authentication.

## Reference
See [[DS-2]] for rationale and trade-offs.
