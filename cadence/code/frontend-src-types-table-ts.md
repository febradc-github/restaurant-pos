---
type: file
tags: [code/frontend]
aliases: ["frontend/src/types/table.ts"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-components-TableLayoutEditor-tsx]]", "[[frontend-src-components-tableZoneGrouping-ts]]", "[[C-37]]"]
sources: []
---

# frontend/src/types/table.ts

Type definitions for table objects and operations (C-37). Reflects the server schema: tables now carry an optional `zone` string and a server-derived `is_occupied` boolean.

## Types

- `TableShape` -- literal union type: `'round' | 'square' | 'rectangular'`
- `Table` -- full table object as returned by the API: `{ id, label, shape, capacity, zone (nullable), is_occupied (read-only), x, y, width, height }`
- `NewTable` -- fields needed to create a table: omits `id` and `is_occupied` (server-derived)
- `TableUpdate` -- partial fields for updates: a `Partial<NewTable>`

## Notes

- `zone`: nullable string representing the floor-plan area this table belongs to (e.g., "Patio"), or null if unassigned. Never sent by the client on create/update (server optional), but required in full Table objects returned by the API.
- `is_occupied`: read-only boolean derived server-side (C-37) based on whether the table has an open order (Pending/Ready status). Never client-supplied.
- Both `NewTable` and `TableUpdate` deliberately exclude `is_occupied` to prevent clients from attempting to set it.

## Imports
- (none)

## Used by
- `frontend/src/api/tables.ts` -- type annotations for API responses and requests
- [[frontend-src-components-TableLayoutEditor-tsx|TableLayoutEditor.tsx]] -- component state and form values
- [[frontend-src-components-tableZoneGrouping-ts|tableZoneGrouping.ts]] -- zone grouping logic
- Various test fixtures across the frontend
