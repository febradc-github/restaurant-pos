---
type: file
tags: [code/frontend]
aliases: ["src/components/TableLayoutEditor.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-api-tables-ts]]", "[[src-types-table-ts]]", "[[src-components-tablelayouteditor-css]]", "[[src-components-tablelayouteditor-test-tsx]]", "[[src-app-tsx]]", "[[US-16]]", "[[US-3]]"]
sources: []
---

# src/components/TableLayoutEditor.tsx

Drag-and-drop floor plan editor. Restyled add-table toolbar (now antd Form with Input/Select/InputNumber/Button inside Card, error is antd Alert), but canvas interaction logic unchanged (all data-testid, pointer-event drag/resize/add/delete). Fetches tables on mount, accepts authToken prop; mutations hidden without it.

## Exports
- `TableLayoutEditor` component (React.FC<{authToken?: string | null}>)

## Imports
- `src/api/tables` -- API calls
- `src/types/table` -- Table/TableShape types
- `antd` -- Form, Input, Select, InputNumber, Button, Card, Alert, Space
- [[src-components-tablelayouteditor-css|src/components/TableLayoutEditor.css]] -- styling
- React, useEffect, useState, useRef

## Used by
- [[src-components-ownerpage-tsx|src/components/OwnerPage.tsx]] -- mounted at `/owner/tables` route
