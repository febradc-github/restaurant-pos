---
type: file
tags: [code/backend]
aliases: ["backend/app/Http/Controllers/Api/TableController.php"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[backend-app-models-table-php]]", "[[C-37]]"]
sources: []
---

# backend/app/Http/Controllers/Api/TableController.php

REST controller for floor-plan table management. Implements CRUD operations: listing all tables with occupancy status, creating/updating/deleting individual tables.

## Architecture notes

- **Centralized occupancy computation** (C-37): `index()` uses `Table::withExists(['orders as is_occupied' => ...])` to compute `is_occupied` server-side once, centrally, from whether any open orders (Pending/Ready status) exist for each table. This single source of truth is then consumed by every client (Owner's table grid, Kitchen display, Cashier terminal, or any future view) rather than each re-deriving the logic themselves.
- **Zone support** (C-37): `zone` field added to validation rules as `['nullable', 'string', 'max:255']`, both create and update paths.
- **Position/size in API contract** (C-37): `x/y/width/height` remain in the schema for create/update and are still validated and stored, but are sent as placeholder values (0/0/shape-default) by the current frontend and not used for rendering. Kept vestigial rather than removed to avoid a breaking change to the API contract.
- **Auth/visibility**: `index()` is open to anyone (no auth check) since Server and Kitchen views need to render the layout without login, per the "no-auth device" access pattern. Store/update/destroy are implicitly owner-only by middleware.

## Exports
- `index()` -- GET /api/tables -- list all tables with computed `is_occupied` flag
- `store(Request $request)` -- POST /api/tables -- create a table
- `update(Request $request, Table $table)` -- PUT /api/tables/{id} -- update a table
- `destroy(Table $table)` -- DELETE /api/tables/{id} -- delete a table
- `rules(bool $sometimes)` -- private validation rules, shared by create and update

## Imports
- `OrderStatus` enum -- to check order status (Pending/Ready)
- `TableShape` enum -- shape validation
- [[backend-app-models-table-php|Table model]] -- with `orders()` relation (C-37)
- `Controller`, `Request`, `JsonResponse`, `Rule` from Laravel -- base controller, request/response, enum validation rule

## Used by
- Frontend TableLayoutEditor component (and any other table-grid views)
- Server/Kitchen display views that render the floor plan
- Tests: backend/tests/Feature/Tables/TableLayoutTest.php
