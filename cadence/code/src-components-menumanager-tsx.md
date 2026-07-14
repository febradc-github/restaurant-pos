---
type: file
tags: [code/frontend]
aliases: ["src/components/MenuManager.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-api-menu-ts]]", "[[src-types-menu-ts]]", "[[src-components-menumanager-css]]", "[[src-components-menumanager-test-tsx]]", "[[src-app-tsx]]", "[[US-16]]", "[[US-4]]"]
sources: []
---

# src/components/MenuManager.tsx

Owner-facing category and menu-item CRUD UI. Fully rebuilt with Ant Design: one Card per section (Categories, Menu Items), each with an inline Form add-row above an antd Table. Row editing uses an editable-cell pattern (Name/Price/Category cells swap to Input/Select when that row's id matches local edit state; Save/Cancel buttons replace Edit/Delete while editing). Availability now uses antd Switch. Preserves: 409-on-delete-with-items error message, category dropdown population from fetched categories, aria-label patterns. Parallel fetch on mount.

## Exports
- `MenuManager` component (React.FC<{authToken?: string | null}>)

## Imports
- `src/api/menu` -- API calls
- `src/types/menu` -- Category, MenuItem types
- `antd` -- Card, Form, Table, Input, Select, Switch, Button, Alert, Space
- [[src-components-menumanager-css|src/components/MenuManager.css]] -- styling
- React, useState, useEffect, useCallback

## Used by
- [[src-components-ownerpage-tsx|src/components/OwnerPage.tsx]] -- mounted at `/owner/menu` route
