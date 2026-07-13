---
type: file
tags: [code/backend]
aliases: ["app/Http/Controllers/Api/CategoryController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-category-php]]", "[[routes-api-php]]", "[[US-4]]"]
sources: []
---

# app/Http/Controllers/Api/CategoryController.php

CRUD endpoints for menu categories. index is open (public). store, update, destroy are owner-gated via auth:sanctum + role:owner middleware. destroy returns 409 Conflict if category still has menu items (restrictOnDelete design—no cascade).

## Exports
- `index()` -- GET /api/categories (open)
- `store()` -- POST /api/categories (role:owner)
- `update()` -- PATCH /api/categories/{id} (role:owner)
- `destroy()` -- DELETE /api/categories/{id} (role:owner, returns 409 if has items)

## Imports
- Category model
- Controller base
- Validation rules
- Response helpers