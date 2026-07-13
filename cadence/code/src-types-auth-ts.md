---
type: file
tags: [code/frontend]
aliases: ["src/types/auth.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-api-auth-ts]]", "[[src-app-tsx]]", "[[src-components-login-tsx]]"]
sources: []
---

# src/types/auth.ts

Auth type definitions: AuthRole ('owner'|'cashier'), AuthUser (identifier, role), AuthSession (user, token). No token renewal/expiry handling in v1.

## Exports
- `type AuthRole` -- role enum type
- `type AuthUser` -- user info shape
- `type AuthSession` -- session shape (user + bearer token)

## Used by
- [[src-api-auth-ts|src/api/auth.ts]] -- returns AuthSession from login
- [[src-app-tsx|src/App.tsx]] -- session state type
- [[src-components-login-tsx|src/components/Login.tsx]] -- onLogin callback type
- [[src-components-checkout-tsx|src/components/Checkout.tsx]] -- role gating
