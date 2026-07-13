---
type: file
tags: [code/frontend]
aliases: ["src/api/menu.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-types-menu-ts]]", "[[src-components-menumanager-tsx]]", "[[src-api-tables-ts]]", "[[US-4]]"]
sources: []
---

# src/api/menu.ts

API client factory for menu management. Pattern mirrors src/api/tables.ts. Exports createMenuApi({baseUrl, token}) returning { categories, menuItems } with list/create/update/remove methods. handleResponse attaches .status property to thrown errors, enabling callers to distinguish e.g. 409 Conflict from other failures (used in MenuManager to display friendly error on delete-category-with-items).

## Exports
- `createMenuApi(config)` -- factory returning { categories, menuItems }
- `handleResponse(response)` -- error wrapper with .status property

## Imports
- `src/types/menu` -- Category, MenuItem
- fetch (browser API)