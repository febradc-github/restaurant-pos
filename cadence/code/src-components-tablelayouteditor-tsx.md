---
type: file
tags: [code/frontend]
aliases: ["src/components/TableLayoutEditor.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["src-api-tables-ts", "src-types-table-ts", "src-app-tsx", "[[US-3]]"]
sources: []
---

# src/components/TableLayoutEditor.tsx

React component: interactive drag-and-drop floor plan editor. Fetches tables on mount, renders draggable/resizable positioned divs (no third-party drag library—plain pointer events). Add/delete buttons, owner-gated (mutations hidden without authToken prop). Accepts authToken prop; mutations require it.

## Exports
- `TableLayoutEditor` component (React.FC with authToken prop)

## Imports
- `src/api/tables` -- API calls
- `src/types/table` -- Table/TableShape types
- React, useEffect, useState, useRef -- React hooks
- CSS styling (TableLayoutEditor.css)

## Used by
- `src/App.tsx` -- rendered with authToken prop