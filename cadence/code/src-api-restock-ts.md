---
type: file
tags: [code/frontend]
aliases: ["src/api/restock.ts"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[src-types-restock-ts]]", "[[src-components-analyticsdashboard-tsx]]", "[[app-http-controllers-api-restockcontroller-php]]", "[[restock-patch-response-gotcha]]", "[[US-25]]", "[[US-26]]"]
sources: []
---

# src/api/restock.ts

Frontend API client for inventory restock management, following the factory pattern. Owner-gated backend (C-25).

## Exports
- `createRestockApi({baseUrl, token})` -- factory function returning the client object
  - `list(): Promise<RestockItem[]>` -- GET /api/inventory-items/restock
  - `updateThreshold(id: number, threshold: number): Promise<InventoryItem>` -- PATCH /api/inventory-items/{id}/threshold

## Imports
- `src/types/restock` -- RestockItem type
- `fetch` (built-in)

## Used by
- [[src-components-analyticsdashboard-tsx|src/components/AnalyticsDashboard.tsx]] -- fetches restock list and handles threshold updates

## Notes
The PATCH response returns a bare InventoryItem (containing only base fields: id, name, stock, threshold). The response does NOT include suggested_threshold or shortfall derived fields. Callers must merge the response into the existing row's state to preserve those fields, never replace the row wholesale. See [[restock-patch-response-gotcha]].
