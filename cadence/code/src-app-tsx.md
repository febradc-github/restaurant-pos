---
type: file
tags: [code/frontend]
aliases: ["src/App.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-login-tsx]]", "[[src-components-checkout-tsx]]", "[[src-components-tablelayouteditor-tsx]]", "[[src-components-menumanager-tsx]]", "[[src-types-auth-ts]]", "[[US-7]]", "[[US-3]]", "[[US-4]]", "[[c3-c4-retroactive-auth-usability]]"]
sources: []
---

# src/App.tsx

App root: session-driven route/role dispatch. Replaced hardcoded `OWNER_AUTH_TOKEN = null` (since C-3, repeatedly deferred TODO) with real `useState<AuthSession|null>`. Logged-out users see Login component. Logged-in owner sees TableLayoutEditor and MenuManager with real token (these were gate-checked for auth but had no way to get a real token until now). Logged-in cashier sees Checkout. OrderTaking and KitchenDisplay remain always-visible (no-login server/kitchen views). Added logout button.

## Exports
- `App()` -- root component: session state, role-based rendering, logout control

## Imports
- [[src-components-login-tsx|src/components/Login.tsx]] -- logout form
- [[src-components-checkout-tsx|src/components/Checkout.tsx]] -- cashier checkout UI
- [[src-components-tablelayouteditor-tsx|src/components/TableLayoutEditor.tsx]] -- owner-only
- [[src-components-menumanager-tsx|src/components/MenuManager.tsx]] -- owner-only
- [[src-components-ordertaking-tsx|src/components/OrderTaking.tsx]] -- always visible
- [[src-components-kitchendisplay-tsx|src/components/KitchenDisplay.tsx]] -- always visible
- [[src-types-auth-ts|src/types/auth.ts]] -- AuthSession, AuthRole types
- `react` -- hooks, JSX

## Used by
- main.tsx -- entry point
