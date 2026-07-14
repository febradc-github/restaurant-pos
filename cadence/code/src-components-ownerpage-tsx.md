---
type: file
tags: [code/frontend]
aliases: ["src/components/OwnerPage.tsx"]
created: 2026-07-14
updated: 2026-07-15
related: ["[[src-components-ownerpage-css]]", "[[src-components-ownerpage-test-tsx]]", "[[src-components-menumanager-tsx]]", "[[src-components-tablelayouteditor-tsx]]", "[[src-components-employeemanager-tsx]]", "[[src-components-analyticsdashboard-tsx]]", "[[src-app-tsx]]", "[[US-16]]", "[[US-22]]", "[[US-26]]", "[[EP-14]]", "[[EP-20]]", "[[EP-23]]"]
sources: []
---

# src/components/OwnerPage.tsx

Owner page shell: Ant Design Layout with collapsible Sider/Menu. Nav items defined as NAV_ENTRIES data array (not hardcoded JSX), so adding future nav items is a one-line addition. Layout.Header shows the active section's title. Layout.Content hosts nested Routes: `/owner/tables` (TableLayoutEditor), `/owner/menu` (MenuManager), `/owner/employees` (EmployeeManager, added in C-22), and `/owner/analytics` (AnalyticsDashboard, added in C-26); `/owner` index redirects to `/owner/tables`. Mounted in App.tsx at `path="/owner/*"` inside existing RoleRoute owner gate (RoleRoute itself and gating logic unchanged).

## Exports
- `OwnerPage` component (React.FC<{session: AuthSession}>)

## Imports
- `src/types/auth` -- AuthSession type
- `antd` -- Layout, Sider, Menu, Button, Typography, TeamOutlined (Employees icon), BarChartOutlined (Analytics icon added in C-26)
- [[src-components-menumanager-tsx|src/components/MenuManager.tsx]] -- menu management route
- [[src-components-tablelayouteditor-tsx|src/components/TableLayoutEditor.tsx]] -- table management route
- [[src-components-employeemanager-tsx|src/components/EmployeeManager.tsx]] -- employee management route (C-22)
- [[src-components-analyticsdashboard-tsx|src/components/AnalyticsDashboard.tsx]] -- analytics dashboard route (C-26)
- [[src-components-ownerpage-css|src/components/OwnerPage.css]] -- styling
- react-router-dom -- Routes, Route, useLocation, useNavigate
- React, useState

## Used by
- [[src-app-tsx|src/App.tsx]] -- rendered at `/owner/*` route

## Notes
The NAV_ENTRIES array pattern continues to validate itself: C-26's addition of the Analytics nav item required only adding one object to the array and adding a matching Route. No restructuring of existing nav entries. This exemplifies data-driven component design as predicted in C-16.
