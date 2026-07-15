---
type: domain
tags: [frontend]
aliases: ["C-30 UI audit findings", "Login page audit"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[US-30]]", "[[AR-frontend-design-system]]", "[[adr-011-patch-ant-design-in-place-over-rebuild]]"]
sources: []
---

# C-30 Audit Findings: Login Page

[[US-30]] audit of Login.tsx against ui-ux-pro-max guidelines. Most of the page was already compliant; only touch-target size needed fixing.

## Fixed
- **Touch targets**: Email Input, password Input.Password, and submit Button all upgraded from antd's default `size="middle"` (~32px) to `size="large"` (44px+) to match the app's established convention used in OrderTaking.tsx, KitchenClockPad.tsx, KitchenDisplay.tsx for touch-critical controls.

## Already Compliant (No Changes)
- **Form labels**: Visible labels (not placeholder-only); both fields required so `requiredMark={false}` is fine—inputs carry `aria-required="true"` for screen readers.
- **Password visibility toggle**: antd Input.Password built-in show/hide works natively.
- **Alert roles**: Error alerts keep native `role="alert"` (audit pattern established in KitchenClockPad.tsx/OrderTaking.tsx of explicit `role="status"` overrides applies only to non-urgent success confirmations, not here).
- **Focus rings**: No custom overrides anywhere in frontend/src; relies on browser defaults.
- **Colors**: No raw hex bypassing theme.ts; uses Ant Design tokens.
- **Spacing**: Already on 4/8px scale.

## Cross-Cutting Pattern (Out of Scope for Single-Page Ticket)
Every page in the app (Checkout, KitchenDisplay, OrderTaking, TableLayoutEditor, Login) uses Typography.Title `level={2}` as its top heading with no page-level `<h1>` anywhere in the SPA. This is app-wide, not Login-specific, and should be addressed separately if ever revisited—not silently fixed in one page's ticket.

## Implications for C-31, C-32, C-33
When auditing other pages ([[US-31]], [[US-32]], [[US-33]]), check touch targets against the 44px+ minimum and size="large" consistency. Other pages may have similar spacing/contrast/role issues to address.
