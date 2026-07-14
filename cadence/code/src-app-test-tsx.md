---
type: file
tags: [code/frontend]
aliases: ["src/App.test.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-app-tsx]]", "[[src-types-auth-ts]]", "[[src-components-login-tsx]]", "[[src-components-checkout-tsx]]", "[[src-components-ordertaking-tsx]]", "[[US-7]]", "[[US-11]]", "[[EP-10]]"]
sources: []
---

# src/App.test.tsx

Tests for App.tsx routing and role-based visibility. Verifies: logged-out state hides both Take-Orders (OrderTaking) and Checkout; Server login reveals Take-Orders and logout returns to Login; Cashier login still reveals Checkout (not Take-Orders); Owner login reveals admin panels. Tests SessionProvider integration and role-gated component rendering.

## Exports
- Test cases for App component: role dispatch, visibility gating, logout behavior
