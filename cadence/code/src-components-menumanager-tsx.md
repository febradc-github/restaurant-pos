---
type: file
tags: [code/frontend]
aliases: ["src/components/MenuManager.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-api-menu-ts]]", "[[src-types-menu-ts]]", "[[src-app-tsx]]", "[[src-components-tablelayouteditor-tsx]]", "[[US-4]]"]
sources: []
---

# src/components/MenuManager.tsx

Owner-facing category and menu-item management UI (+ MenuManager.css). Parallel fetch on mount. Forms with owner-gated controls. Inline edit-in-place for names/prices. Availability checkbox triggers immediate PATCH. 409 Conflict on delete-with-items caught and displayed as friendly error (not swallowed or crashed). Mirrors TableLayoutEditor pattern.

## Exports
- `MenuManager` component (React.FC<{authToken?: string | null}>)

## Imports
- `src/api/menu`
- `src/types/menu`
- React, useState, useEffect
- CSS