---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/OwnerPage.tsx"]
created: 2026-07-15
updated: 2026-07-16
related: ["[[US-31]]", "[[TK-34]]", "[[frontend-src-components-OwnerPage-test-tsx]]", "[[C-37]]"]
sources: []
---

# frontend/src/components/OwnerPage.tsx

Owner Console shell layout wrapping four admin sections (Table Layout Editor, Menu Manager, Employee Manager, Analytics Dashboard). Provides navigation, theme toggle, and user menu in the header.

## Changes (C-31)

Replaced the built-in antd `Layout.Sider` collapse trigger (a bare `<div onClick>` with no accessible name or keyboard focus) with an explicit `Button` component in the Header. The trigger now has:
- `aria-label` that switches between "Collapse navigation" and "Expand navigation" states
- `MenuFoldOutlined`/`MenuUnfoldOutlined` icons to indicate the action
- Full keyboard accessibility and screen reader support
- `Layout.Sider trigger={null}` to suppress the default inaccessible trigger

## Changes (C-34)

`<Layout.Sider>` now has an explicit `width={230}` (was implicitly antd's 200px default). Root cause of the truncation bug: antd's default 200px Sider width assumes antd's own 14px default font size, but this app's theme.ts sets fontSize:16, so the longest nav label "Menu Management" no longer fit and antd's built-in menu-item ellipsis truncated it to "Menu Manage...". The `collapsedWidth` remains antd's 80px default, so the collapsed icon-only state is unchanged.

## Changes (C-37)

Tablet-width responsiveness: `<Layout.Sider>` gained `breakpoint="lg"` (991.98px viewport width), `onBreakpoint={setBroken}`, and conditional `collapsedWidth={broken ? 0 : 80}`. Below ~992px width:
- The sider auto-collapses (triggered by antd's own breakpoint observer) and disappears off-canvas entirely (collapsedWidth=0) rather than sitting as an 80px icon rail
- The existing header toggle button (C-31) then acts as a drawer trigger to expand it back to full width as an overlay reveal
- Desktop behavior (80px icon-rail collapse) unchanged

## Exports
- `OwnerPage` (component) -- admin console shell with accessible sider collapse and responsive layout

## Imports
- `Layout`, `Button`, `Menu`, `Typography` from `antd` -- UI components
- `MenuFoldOutlined`, `MenuUnfoldOutlined`, `TableOutlined`, `BarChartOutlined`, `TeamOutlined`, `AppstoreOutlined` from `@ant-design/icons` -- navigation/collapse icons
- `Navigate`, `Route`, `Routes`, `useLocation`, `useNavigate` from `react-router-dom` -- routing
- [[frontend-src-components-TableLayoutEditor-tsx|TableLayoutEditor]], [[frontend-src-components-MenuManager-tsx|MenuManager]], [[frontend-src-components-EmployeeManager-tsx|EmployeeManager]], [[frontend-src-components-AnalyticsDashboard-tsx|AnalyticsDashboard]] -- section components
- [[frontend-src-components-OwnerPage-css|OwnerPage.css]] -- layout styling

## Used by
- Router configuration as the `/owner` route view
