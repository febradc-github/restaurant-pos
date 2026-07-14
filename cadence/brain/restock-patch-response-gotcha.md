---
type: domain
tags: [code/frontend, backend/database]
aliases: ["restock threshold update gotcha", "PATCH inventory-items response"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[src-api-restock-ts]]", "[[src-components-analyticsdashboard-tsx]]", "[[app-http-controllers-api-restockcontroller-php]]", "[[US-25]]", "[[US-26]]"]
sources: []
---

# PATCH /api/inventory-items/{id}/threshold returns bare InventoryItem (gotcha for C-26)

When updating a restock threshold via `PATCH /api/inventory-items/{id}/threshold`, the backend response is a bare InventoryItem containing only base fields (id, name, stock, threshold). The response omits the derived fields suggested_threshold and shortfall.

## Impact

In AnalyticsDashboard.tsx (or any other consumer of the restock API), when a user edits the threshold column in the restock table:

**WRONG (row data will lose suggested_threshold/shortfall):**
```typescript
// DON'T do this — it drops the derived fields
row = await restockApi.updateThreshold(id, newThreshold);
// row no longer has suggested_threshold or shortfall
setState(oldRows => oldRows.map(r => r.id === id ? row : r));
```

**RIGHT (merge the response into the existing row):**
```typescript
// DO this — merge the response into the existing row
const updated = await restockApi.updateThreshold(id, newThreshold);
setState(oldRows => oldRows.map(r => 
  r.id === id 
    ? { ...r, ...updated } // merge: keeps suggested_threshold/shortfall
    : r
));
```

## Why

The backend (RestockController, C-25) computes suggested_threshold and shortfall once when initially listing restock items. A PATCH to update only the threshold does not re-trigger that computation; the response is the InventoryItem model serialized directly without those derived fields. Refetching the full list() is expensive; merging the single-field update is the correct approach.

## Reminder for Next Person

When working on the restock table or similar inventory UIs: if you update a threshold and the row data suddenly has no suggested_threshold or shortfall, check that your state merge is spreading the entire old row, not replacing it.
