---
type: file
tags: [code/frontend]
aliases: ["src/components/Login.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-app-tsx]]", "[[src-api-auth-ts]]", "[[src-types-auth-ts]]", "[[US-7]]"]
sources: []
---

# src/components/Login.tsx

Login form component: identifier + password input, calls onLogin(session) callback on success, displays error feedback on auth failure. This is the first real auth UI in the project (App.tsx previously had hardcoded null token).

## Exports
- `Login(props: {onLogin: (session: AuthSession) => void})` -- renders auth form, calls callback on login success

## Imports
- [[src-api-auth-ts|src/api/auth.ts]] -- uses createAuthApi().login()
- [[src-types-auth-ts|src/types/auth.ts]] -- AuthSession type
- `react` -- hooks, JSX

## Used by
- [[src-app-tsx|src/App.tsx]] -- renders when logged out
