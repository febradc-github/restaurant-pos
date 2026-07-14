---
type: file
tags: [code/frontend]
aliases: ["src/components/KitchenPage.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-kitchenpage-css]]", "[[src-components-kitchenpage-test-tsx]]", "[[src-components-kitchendisplay-tsx]]", "[[src-app-tsx]]", "[[adr-008-server-login-kitchen-pin-attendance]]", "[[US-19]]", "[[EP-14]]"]
sources: []
---

# src/components/KitchenPage.tsx

Kitchen display page shell: Ant Design Layout with fixed padding chrome. Pure presentational wrapper mirroring CashierPage/TakeOrdersPage pattern—wraps KitchenDisplay feature component in standardized page layout. Critically different: takes only an `apiBaseUrl` prop and imports NOTHING from the auth/session system. Mounted in App.tsx at `/kitchen` with NO RoleRoute wrapper at all—this is deliberate per [[adr-008-server-login-kitchen-pin-attendance]]. Kitchen order display must remain reachable with zero login friction, since kitchen staff share one device and need instant order visibility.

## Exports
- `KitchenPage(props: {apiBaseUrl: string})` -- kitchen display page wrapper

## Imports
- [[src-components-kitchendisplay-tsx|src/components/KitchenDisplay.tsx]] -- kitchen display feature component
- [[src-components-kitchenpage-css|src/components/KitchenPage.css]] -- styling
- `antd` -- Layout, Layout.Content
- `react` -- React.FC

## Used by
- [[src-app-tsx|src/App.tsx]] -- rendered at `/kitchen` route (no guard)
