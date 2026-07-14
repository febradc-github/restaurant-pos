---
type: file
tags: [code/frontend]
aliases: ["src/components/TakeOrdersPage.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-takeorderspage-css]]", "[[src-components-takeorderspage-test-tsx]]", "[[src-components-ordertaking-tsx]]", "[[src-app-tsx]]", "[[US-18]]", "[[EP-14]]"]
sources: []
---

# src/components/TakeOrdersPage.tsx

Server take-orders page shell: Ant Design Layout with fixed padding chrome. Mirrors CashierPage pattern—wraps OrderTaking feature component in standardized page layout. Header section (implicit; Layout.Content handles all chrome). Mounted in App.tsx at `/take-orders` inside existing RoleRoute server gate (RoleRoute itself and gating logic unchanged). No auth token passed.

## Exports
- `TakeOrdersPage()` -- take-orders page wrapper

## Imports
- [[src-components-ordertaking-tsx|src/components/OrderTaking.tsx]] -- order-taking feature component
- [[src-components-takeorderspage-css|src/components/TakeOrdersPage.css]] -- styling
- `antd` -- Layout, Layout.Content
- `react` -- React.FC

## Used by
- [[src-app-tsx|src/App.tsx]] -- rendered at `/take-orders` route
