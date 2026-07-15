---
type: file
tags: [code/frontend]
aliases: ["src/components/Login.tsx"]
created: 2026-07-14
updated: 2026-07-15
related: ["[[src-app-tsx]]", "[[src-components-login-css]]", "[[src-components-login-test-tsx]]", "[[src-api-auth-ts]]", "[[src-types-auth-ts]]", "[[US-15]]", "[[US-7]]", "[[US-30]]"]
sources: []
---

# src/components/Login.tsx

Login form component rebuilt with Ant Design (`Card`, `Typography.Title`, `Form`, `Form.Item`, `Input`, `Input.Password`, `Alert`, `Button`, user/lock icons from `@ant-design/icons`), replacing the old plain HTML form. Behavior unchanged: identifier + password submit, error shown via `Alert` (renders `role="alert"` natively—existing test queries needed no changes), disabled + loading while submitting. On success now navigates to the logged-in role's home route (owner → `/owner`, cashier → `/cashier`, server → `/take-orders`) instead of just calling a callback. All interactive elements use `size="large"` (44px+ height) for touch-target compliance per [[US-30]].

## Exports
- `Login(props)` -- antd-based form component with role-aware navigation on success; props: apiBaseUrl, onLogin callback
- `LoginProps` -- interface for component props

## Imports
- `antd` -- Card, Typography, Form, Input, Alert, Button
- `@ant-design/icons` -- UserOutlined, LockOutlined
- [[src-api-auth-ts|src/api/auth.ts]] -- createAuthApi().login()
- [[src-types-auth-ts|src/types/auth.ts]] -- AuthSession type
- `react-router-dom` -- useNavigate
- `react` -- hooks, JSX
- `./Login.css` -- local styles

## Used by
- [[src-app-tsx|src/App.tsx]] -- renders when logged out or at `/login` route
