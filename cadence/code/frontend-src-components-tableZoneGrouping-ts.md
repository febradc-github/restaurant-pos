---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/tableZoneGrouping.ts"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-components-TableLayoutEditor-tsx]]", "[[frontend-src-types-table-ts]]", "[[frontend-src-components-tableZoneGrouping-test-ts]]", "[[C-37]]"]
sources: []
---

# frontend/src/components/tableZoneGrouping.ts

Pure grouping and sorting helper for zone-based table layout (C-37). Extracted to a separate tested module following this codebase's established pattern of factoring pure logic alongside the component that uses it (same pattern as `salesTrendChartMath.ts`, `attendanceAggregation.ts`).

## Logic

- Groups tables by their `zone` field; tables with null or blank zone are normalized to the constant `UNASSIGNED_ZONE` ("Unassigned")
- Within each zone, tables maintain their original id/creation order (no drag-to-reorder)
- Zones appear in the order their first table appears in the input array, except `UNASSIGNED_ZONE` always sorts last regardless of position
- Returns an array of `TableZoneGroup` objects, each holding a zone name and its tables

## Exports
- `UNASSIGNED_ZONE` (constant string) -- heading used for tables with no zone set
- `TableZoneGroup` (interface) -- `{ zone: string; tables: Table[] }`
- `groupTablesByZone(tables: Table[]): TableZoneGroup[]` -- main grouping function

## Imports
- [[frontend-src-types-table-ts|Table]] from `../types/table` -- type annotation

## Used by
- [[frontend-src-components-TableLayoutEditor-tsx|TableLayoutEditor.tsx]] to group and render table cards
