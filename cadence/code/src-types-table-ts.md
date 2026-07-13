---
type: file
tags: [code/frontend]
aliases: ["src/types/table.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["src-api-tables-ts", "src-components-tablelayouteditor-tsx", "[[US-3]]"]
sources: []
---

# src/types/table.ts

Shared TypeScript interfaces for table domain: Table (full record with id), NewTable (create payload), TableUpdate (mutation payload), TableShape (union of round|square|rectangular). Mirrors backend TableShape enum.

## Exports
- `interface Table` -- id, label, shape, capacity, x, y, width, height, timestamps
- `type NewTable` -- create payload (label, shape, capacity, x, y, width, height)
- `type TableUpdate` -- mutation payload (optional fields)
- `type TableShape` -- 'round' | 'square' | 'rectangular'