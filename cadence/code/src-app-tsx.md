---
type: file
tags: [code/frontend]
aliases: ["src/App.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-login-tsx]]", "[[src-components-checkout-tsx]]", "[[src-components-ownerpage-tsx]]", "[[src-components-takeorderspage-tsx]]", "[[src-components-kitchendisplay-tsx]]", "[[src-types-auth-ts]]", "[[src-theme-ts]]", "[[c-16-19-page-pattern-guidance]]", "[[antd-jsdom-test-gotcha]]", "[[splat-route-relative-navigation-infinite-loop]]", "[[antd-form-field-dom-id-collision]]", "[[US-16]]", "[[US-15]]", "[[US-7]]", "[[US-3]]", "[[US-4]]", "[[US-11]]", "[[US-18]]", "[[EP-14]]", "[[c3-c4-retroactive-auth-usability]]"]
sources: []
---

# src/App.tsx

App root with react-router routing and role-based access control. Routes: `/login`, `/owner/*` (OwnerPage), `/cashier`, `/take-orders`, `/kitchen`. RoleRoute wrapper component (render-prop: `children: (session) => ReactNode`) redirects to `/login` unless session's role matches required role. `/kitchen` has no guard. Logged-in visitor hitting `/login` redirects to their role's home route. Wraps entire tree in antd ConfigProvider (using theme.ts) and antd App (aliased AntdApp) for message/notification context. SessionBar is minimal Typography.Text+Button, unstyled—each page owns its own chrome.

## Exports
- `App()` -- root component with Routes, RoleRoute wrapper, ConfigProvider setup
- `RoleRoute(props: {requiredRole: AuthRole, children: (session: AuthSession) => ReactNode})` -- render-prop auth guard

## Imports
- `react-router-dom` -- Routes, Route, useNavigate, useLocation
- `antd` -- ConfigProvider, App (AntdApp), Typography, Button, Spin
- [[src-components-login-tsx|src/components/Login.tsx]] -- `/login` route
- [[src-components-checkout-tsx|src/components/Checkout.tsx]] -- `/cashier` route
- [[src-components-ownerpage-tsx|src/components/OwnerPage.tsx]] -- `/owner/*` routes (nested TableLayoutEditor, MenuManager via OwnerPage)
- [[src-components-takeorderspage-tsx|src/components/TakeOrdersPage.tsx]] -- `/take-orders` route (wraps OrderTaking)
- [[src-components-kitchendisplay-tsx|src/components/KitchenDisplay.tsx]] -- `/kitchen` route (no guard)
- [[src-types-auth-ts|src/types/auth.ts]] -- AuthSession, AuthRole types
- [[src-theme-ts|src/theme.ts]] -- antd ConfigProvider themeToken
- `react` -- hooks, JSX

## Used by
- [[src-main-tsx|src/main.tsx]] -- wrapped in BrowserRouter
