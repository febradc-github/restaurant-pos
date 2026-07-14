---
type: file
tags: [code/frontend]
aliases: ["src/App.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-login-tsx]]", "[[src-components-checkout-tsx]]", "[[src-components-tablelayouteditor-tsx]]", "[[src-components-menumanager-tsx]]", "[[src-components-ordertaking-tsx]]", "[[src-components-kitchendisplay-tsx]]", "[[src-types-auth-ts]]", "[[src-theme-ts]]", "[[US-15]]", "[[US-7]]", "[[US-3]]", "[[US-4]]", "[[US-11]]", "[[EP-14]]", "[[c3-c4-retroactive-auth-usability]]"]
sources: []
---

# src/App.tsx

App root with react-router routing and role-based access control. Replaced session callback pattern with a `<Routes>` tree: `/login`, `/owner`, `/cashier`, `/take-orders`, `/kitchen`. `RoleRoute` wrapper component (render-prop pattern: `children: (session) => ReactNode`) redirects to `/login` unless session's role matches the required role. `/kitchen` has no guard, preserving the no-login constraint from adr-008. Logged-in visitor hitting `/login` redirects to their role's home route; unmatched paths fall back via catch-all. Wraps entire tree in antd's `ConfigProvider` (using theme.ts) and antd's `<App>` (aliased `AntdApp` to avoid collision) for message/notification context. `SessionBar` is minimal antd `Typography.Text`+`Button`, deliberately unstyled/unpositioned—each page story owns its own header/nav chrome.

## Exports
- `App()` -- root component with Routes, role-gated RoleRoute wrapper, ConfigProvider setup
- `RoleRoute(props: {requiredRole: AuthRole, children: (session: AuthSession) => ReactNode})` -- render-prop auth guard

## Imports
- `react-router-dom` -- Routes, Route, useNavigate, useLocation
- `antd` -- ConfigProvider, App (AntdApp), Typography, Button, Spin
- [[src-components-login-tsx|src/components/Login.tsx]] -- Login component
- [[src-components-checkout-tsx|src/components/Checkout.tsx]] -- Cashier checkout UI
- [[src-components-tablelayouteditor-tsx|src/components/TableLayoutEditor.tsx]] -- Owner-only
- [[src-components-menumanager-tsx|src/components/MenuManager.tsx]] -- Owner-only
- [[src-components-ordertaking-tsx|src/components/OrderTaking.tsx]] -- Server-only (gated by RoleRoute)
- [[src-components-kitchendisplay-tsx|src/components/KitchenDisplay.tsx]] -- Always visible (no guard)
- [[src-types-auth-ts|src/types/auth.ts]] -- AuthSession, AuthRole types
- [[src-theme-ts|src/theme.ts]] -- antd ConfigProvider themeToken
- `react` -- hooks, JSX

## Used by
- [[src-main-tsx|src/main.tsx]] -- wrapped in BrowserRouter
