---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/TableLayoutEditor.tsx"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-components-tableZoneGrouping-ts]]", "[[frontend-src-types-table-ts]]", "[[frontend-src-components-TableLayoutEditor-test-tsx]]", "[[US-37]]"]
sources: []
---

# frontend/src/components/TableLayoutEditor.tsx

Owner-facing table management screen (C-37): zone-grouped grid of color-coded table cards. Replaces the earlier canvas-based drag/resize floor-plan editor (see adr-012). A stat row summarizes table/seat/occupancy counts, an inline form adds tables, and selecting a card opens a detail panel with Edit/Duplicate/Remove actions.

## Architecture notes

- **Occupancy color-coding**: green for available, red for occupied (two states only). A third "reserved" state was originally in SP-37 but cut during implementation when the user confirmed no reservation data model exists yet; a full booking system is deferred to a future, not-yet-created story (its id was not reserved -- C-40 has since been used for an unrelated task).
- **Occupancy logic**: read straight off each table's server-computed `is_occupied` flag (TableController@index, C-37) rather than derived here from /api/orders -- one shared definition of "occupied" for every consumer of the tables endpoint.
- **Position/size placeholders**: `x/y/width/height` are sent as inert placeholder values (0/0/shape-default) on create/duplicate -- kept vestigial in the API contract rather than removed, a deliberate scope-boundary decision. When selecting a shape, sensible defaults are drawn from `SHAPE_DEFAULTS` map; duplicating a table preserves the original's dimensions.
- **Zone grouping**: tables grouped by zone in first-appearance order via `groupTablesByZone()`, with an "Unassigned" catch-all group always sorted last. See `tableZoneGrouping.ts`.
- **Theme colors**: card backgrounds sourced via `theme.useToken()` -- `colorSuccessBg`/`colorErrorBg` -- not hardcoded hex, matching the established runtime-theme-color pattern from `SalesTrendChart.tsx`/`App.tsx`'s `SessionBar`.
- **Read-only gating**: when `authToken` is absent, the grid renders read-only: no add form, no Edit/Duplicate/Remove controls. Real enforcement happens server-side.
- **Detail panel**: right-hand panel shows Shape/Seats/Zone/Server fields with `Descriptions` component. Server is always rendered as `--` since no Order->user/server relation exists to derive an assigned-server name from.

## Exports
- `TableLayoutEditor` (component) -- table management UI with zone-grouped card grid
- `TableLayoutEditorProps` (interface) -- accepts `apiBaseUrl?` and `authToken?` props

## Imports
- `useEffect`, `useMemo`, `useState` from `react` -- hooks
- `Alert`, `Button`, `Card`, `Descriptions`, `Form`, `Input`, `InputNumber`, `Modal`, `Popconfirm`, `Select`, `Statistic`, `Typography`, `theme as antdTheme` from `antd` -- UI components
- `createTablesApi` from `../api/tables` -- API client
- [[frontend-src-types-table-ts|Table, NewTable, TableShape, TableUpdate types]]
- [[frontend-src-components-tableZoneGrouping-ts|groupTablesByZone, UNASSIGNED_ZONE]] -- zone grouping logic
- `./TableLayoutEditor.css` -- layout/grid styling

## Used by
- [[frontend-src-components-OwnerPage-tsx|OwnerPage.tsx]] at `/owner/tables` route
