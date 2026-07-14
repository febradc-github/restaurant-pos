---
type: file
tags: [code/frontend]
aliases: ["src/App.test.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-app-tsx]]", "[[src-types-auth-ts]]", "[[src-components-login-tsx]]", "[[src-test-setup-ts]]", "[[US-15]]", "[[US-7]]", "[[US-11]]", "[[EP-14]]"]
sources: []
---

# src/App.test.tsx

Tests for App.tsx routing and role-based access control. Rewritten to render through `MemoryRouter` with specific `initialEntries` per test instead of the old inline-conditional structure. Tests verify: `/owner`, `/cashier`, `/take-orders` redirect to `/login` with no session; `/kitchen` renders with no redirect (preserving adr-008 no-login constraint); correct role pages render when logged in. Parametrized `it.each` for the three gated routes.

## Exports
- Test cases for App component: route gating, role dispatch, RoleRoute redirect behavior
