---
type: file
tags: [code/frontend]
aliases: ["src/api/tables.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["src-types-table-ts", "src-components-tablelayouteditor-tsx", "[[US-3]]"]
sources: []
---

# src/api/tables.ts

HTTP client wrapper for table endpoints: GET/POST/PATCH/DELETE /api/tables. Parameterized by base URL and optional Bearer token; enables public read and authenticated mutations.

## Exports
- `getTables(baseUrl, token?)` -- fetch all tables
- `createTable(baseUrl, table, token)` -- POST new table (requires token)
- `updateTable(baseUrl, id, updates, token)` -- PATCH table (requires token)
- `deleteTable(baseUrl, id, token)` -- DELETE table (requires token)

## Imports
- `src/types/table` -- Table/NewTable/TableUpdate types