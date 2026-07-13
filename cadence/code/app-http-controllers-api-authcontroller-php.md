---
type: file
tags: [code/backend]
aliases: ["app/Http/Controllers/Api/AuthController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-enums-userrole-php]]", "[[app-http-middleware-ensureuserhasrole-php]]", "[[routes-api-php]]", "[[US-2]]"]
sources: []
---

# app/Http/Controllers/Api/AuthController.php

Login and logout actions for Sanctum bearer token auth. Login accepts identifier (email/phone) + password and issues a plainTextToken via Sanctum's createToken(). Logout revokes the current token via token()->delete().

## Exports
- `login(Request)` -- accepts identifier + password, returns bearer token
- `logout(Request)` -- revokes current token, returns success response
