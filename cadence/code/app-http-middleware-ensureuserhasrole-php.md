---
type: file
tags: [code/backend]
aliases: ["app/Http/Middleware/EnsureUserHasRole.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-enums-userrole-php]]", "[[routes-api-php]]", "[[US-2]]"]
sources: []
---

# app/Http/Middleware/EnsureUserHasRole.php

Role-gate middleware enforcing role-based access at the API level. Aliased as `role` in bootstrap/app.php. Used as route middleware in the form ->middleware(['auth:sanctum', 'role:owner']) to restrict access by one or more roles.

## Exports
- `handle(Request, Closure, ...$roles)` -- validates authenticated user's role against allowed roles, aborts 403 if unauthorized
