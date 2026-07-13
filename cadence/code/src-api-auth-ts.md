---
type: file
tags: [code/frontend]
aliases: ["src/api/auth.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-types-auth-ts]]", "[[src-components-login-tsx]]"]
sources: []
---

# src/api/auth.ts

Auth API client factory. Returns object with login(identifier, password) and logout() functions wrapping POST /api/login and /api/logout. Returns AuthSession on success or throws on failure.

## Exports
- `createAuthApi()` -- factory returning {login, logout} async functions

## Imports
- [[src-types-auth-ts|src/types/auth.ts]] -- AuthSession type
- `fetch` or HTTP client -- HTTP requests

## Used by
- [[src-components-login-tsx|src/components/Login.tsx]] -- calls login()
- [[src-app-tsx|src/App.tsx]] -- calls logout()
