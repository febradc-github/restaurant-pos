---
type: file
tags: [code/backend]
aliases: ["routes/api.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-http-controllers-api-authcontroller-php]]", "[[app-http-controllers-api-ownercontroller-php]]", "[[app-http-controllers-api-cashiercontroller-php]]", "[[app-http-controllers-api-statuscontroller-php]]", "[[app-http-middleware-ensureuserhasrole-php]]", "[[US-2]]"]
sources: []
---

# routes/api.php

Central API route registration. Registers public (no auth) and authenticated routes using the Sanctum guard and role middleware. Public: /api/status, /api/login, /api/logout. Guarded: /api/owner/* (Owner only), /api/cashier/* (Cashier only).

## Imports
- [[app-http-controllers-api-authcontroller-php|AuthController]]
- [[app-http-controllers-api-ownercontroller-php|OwnerController]]
- [[app-http-controllers-api-cashiercontroller-php|CashierController]]
- [[app-http-controllers-api-statuscontroller-php|StatusController]]
