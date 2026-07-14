---
type: file
tags: [code/frontend]
aliases: ["src/components/OwnerPage.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-ownerpage-css]]", "[[src-components-ownerpage-test-tsx]]", "[[src-components-menumanager-tsx]]", "[[src-components-tablelayouteditor-tsx]]", "[[src-app-tsx]]", "[[US-16]]", "[[EP-14]]"]
sources: []
---

# src/components/OwnerPage.tsx

Owner page shell: Ant Design Layout with collapsible Sider/Menu. Nav items defined as NAV_ENTRIES data array (not hardcoded JSX), so adding future Employee Management / Analytics Dashboard nav item is a one-line addition. Layout.Header shows the active section's title. Layout.Content hosts nested Routes: `/owner/tables` (TableLayoutEditor) and `/owner/menu` (MenuManager); `/owner` index redirects to `/owner/tables`. Mounted in App.tsx at `path="/owner/*"` inside existing RoleRoute owner gate (RoleRoute itself and gating logic unchanged).

## Exports
- `OwnerPage` component (React.FC<{session: AuthSession}>)

## Imports
- `src/types/auth` -- AuthSession type
- `antd` -- Layout, Sider, Menu, Button, Typography
- [[src-components-menumanager-tsx|src/components/MenuManager.tsx]] -- menu management route
- [[src-components-tablelayouteditor-tsx|src/components/TableLayoutEditor.tsx]] -- table management route
- [[src-components-ownerpage-css|src/components/OwnerPage.css]] -- styling
- react-router-dom -- Routes, Route, useLocation, useNavigate
- React, useState

## Used by
- [[src-app-tsx|src/App.tsx]] -- rendered at `/owner/*` route
