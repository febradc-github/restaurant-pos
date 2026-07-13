---
type: file
tags: [code/backend]
aliases: ["app/Http/Controllers/Api/MenuItemController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-menuitem-php]]", "[[routes-api-php]]", "[[US-4]]"]
sources: []
---

# app/Http/Controllers/Api/MenuItemController.php

CRUD endpoints for menu items. index is open (public), supports optional ?category_id filter. store, update, destroy are owner-gated. availability toggled via plain PATCH (idempotent).

## Exports
- `index()` -- GET /api/menu-items (open, optional ?category_id filter)
- `store()` -- POST /api/menu-items (role:owner)
- `update()` -- PATCH /api/menu-items/{id} (role:owner)
- `destroy()` -- DELETE /api/menu-items/{id} (role:owner)

## Imports
- MenuItem model
- Controller base
- Validation rules
- Response helpers