---
type: file
tags: [code/frontend]
aliases: ["src/components/CashierPage.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-cashierpage-css]]", "[[src-components-cashierpage-test-tsx]]", "[[src-components-checkout-tsx]]", "[[src-app-tsx]]", "[[US-17]]", "[[EP-14]]"]
sources: []
---

# src/components/CashierPage.tsx

Cashier page shell: Ant Design Layout with fixed padding chrome. Mirrors OwnerPage pattern—wraps Checkout feature component in standardized page layout. Header section (implicit; Layout.Content handles all chrome). Mounted in App.tsx at `/cashier` inside existing RoleRoute cashier gate (RoleRoute itself and gating logic unchanged). Passes authToken and apiBaseUrl through to Checkout.

## Exports
- `CashierPage(props: {authToken: string, apiBaseUrl: string})` -- cashier page wrapper

## Imports
- [[src-components-checkout-tsx|src/components/Checkout.tsx]] -- checkout feature component
- [[src-components-cashierpage-css|src/components/CashierPage.css]] -- styling
- `antd` -- Layout, Layout.Content
- `react` -- React.FC

## Used by
- [[src-app-tsx|src/App.tsx]] -- rendered at `/cashier` route
