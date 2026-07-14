---
type: file
tags: [code/frontend]
aliases: ["src/types/restock.ts"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[src-api-restock-ts]]", "[[src-components-analyticsdashboard-tsx]]", "[[US-25]]", "[[US-26]]"]
sources: []
---

# src/types/restock.ts

TypeScript types for inventory restock data from backend Restock API (C-25).

## Exports
- `RestockItem` -- `{id: number, name: string, stock: number, threshold: number, suggested_threshold: number, shortfall: number}` where all numeric fields are numbers (not strings)

## Imports
(none)

## Used by
- [[src-api-restock-ts|src/api/restock.ts]] -- type signature for list() return
- [[src-components-analyticsdashboard-tsx|src/components/AnalyticsDashboard.tsx]] -- typed props for restock table display

## Notes
The suggested_threshold and shortfall fields are derived/computed by the backend. When the PATCH threshold endpoint is called, the response is a bare InventoryItem (no suggested_threshold/shortfall). See [[restock-patch-response-gotcha]] for handling.
