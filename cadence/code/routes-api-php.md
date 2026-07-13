---
type: file
tags: [code/backend]
aliases: ["routes/api.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["app-http-controllers-api-tablecontroller-php", "[[US-3]]"]
sources: []
---

# routes/api.php

API route definitions. Modified to add: GET /api/tables (public index via TableController), and role:owner group for POST/PATCH/DELETE /api/tables[/{table}] mutations using auth:sanctum + role middleware (C-2 pattern).

## Exports
- GET /api/tables → TableController@index (open)
- POST /api/tables → TableController@store (role:owner)
- PATCH /api/tables/{table} → TableController@update (role:owner)
- DELETE /api/tables/{table} → TableController@destroy (role:owner)

## Imports
- `app/Http/Controllers/Api/TableController`