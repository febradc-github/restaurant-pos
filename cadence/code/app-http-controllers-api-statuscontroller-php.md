---
type: file
tags: [code/backend]
aliases: ["app/Http/Controllers/Api/StatusController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[routes-api-php]]", "[[US-2]]"]
sources: []
---

# app/Http/Controllers/Api/StatusController.php

No-auth-required system status endpoint (GET /api/status). Pattern for future Server/Kitchen endpoints that do not require login; the route carries no auth:sanctum middleware.

## Exports
- `show(Request)` -- returns system status
