---
type: domain
tags: [code/frontend]
aliases: ["C-16-19 page layout pattern"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-15]]", "[[US-16]]", "[[US-17]]", "[[US-18]]", "[[US-19]]", "[[EP-14]]"]
sources: []
---

# C-16-19: Page layout and navigation pattern

Each role's existing feature component (TableLayoutEditor+MenuManager for owner, Checkout for cashier, OrderTaking for server, KitchenDisplay+KitchenClockPad for kitchen) already renders at its correct, gated route today—completely unstyled, no routing logic of their own.

**Pattern for C-16-19:** Build page layout, navigation chrome, and header around what's already mounted at the route, not re-plumb routing or duplicate RoleRoute gating logic. Examples:
- Owner page: navbar + sidebar + TableLayoutEditor/MenuManager below
- Cashier page: header + Checkout below
- Server (Take-Orders) page: header + OrderTaking below
- Kitchen page (no auth): header + KitchenDisplay + KitchenClockPad below

If a page needs the session/token beyond what's already passed as a prop, extending RoleRoute's render-prop (`children: (session) => ReactNode`) or lifting session into React Context is the intended extension point. Do not create a per-page auth gate.

All pages use the same ConfigProvider theme (frontend/src/theme.ts) applied at App.tsx—no per-page theme config needed.
