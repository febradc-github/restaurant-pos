---
type: file
tags: [code/backend]
aliases: ["app/Http/Controllers/Api/TableController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["app-models-table-php", "routes-api-php", "tests-feature-tables-tablelayouttest-php", "[[US-3]]"]
sources: []
---

# app/Http/Controllers/Api/TableController.php

REST controller for table resource. Index endpoint (public, no auth); store/update/destroy gated by role:owner middleware and auth:sanctum (established in C-2). Returns JSON with shape enum and floor-plan position/size.

## Exports
- `index()` -- GET /api/tables (public)
- `store()` -- POST /api/tables (role:owner)
- `update()` -- PUT/PATCH /api/tables/{table} (role:owner)
- `destroy()` -- DELETE /api/tables/{table} (role:owner)

## Imports
- `app/Models/Table` -- model
- Laravel auth, middleware patterns