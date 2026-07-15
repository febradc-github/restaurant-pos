---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/OwnerPage.tsx"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[US-31]]"]
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

## Exports
- `OwnerPage` (component) -- admin console shell with accessible sider collapse

## Imports
- `Layout`, `Button`, `Space` from `antd` -- UI components
- `MenuFoldOutlined`, `MenuUnfoldOutlined` from `@ant-design/icons` -- collapse state icons
- `useTheme` -- context for theme toggle state
- [[frontend-src-components-OwnerPage-css|OwnerPage.css]] -- layout styling

## Used by
- Router configuration as the `/owner` route view
