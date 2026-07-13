---
type: file
tags: [code/backend]
aliases: ["app/Services/Receipts/PrintAgentClient.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-http-controllers-api-ordercontroller-php]]", "[[AR-print-agent-polyglot]]", "[[US-7]]"]
sources: []
---

# app/Services/Receipts/PrintAgentClient.php

Print integration client: builds receipt payload and POSTs to the standalone print-agent service (C-8, separate polyglot daemon). Catches connection exceptions and non-2xx responses, logs a warning, returns bool (NEVER throws). Deliberately designed this way so print failures can never roll back a payment that already succeeded. Request payload: {restaurantName, timestamp (order.paid_at ISO8601), items: [{name, qty, price}], total, openDrawer (true only for cash payments)}.

## Exports
- `sendReceipt(Order $order, PrintStatus &$status): bool` -- POSTs to print-agent, returns success; populates $status reference with 'printed'|'failed'

## Imports
- `app/Models/Order` -- Eloquent model
- `Illuminate/Http/Client` -- Laravel HTTP client
- `config/services` -- print_agent.port from env

## Used by
- [[app-http-controllers-api-ordercontroller-php|app/Http/Controllers/Api/OrderController.php]] -- called in checkout() action after payment confirmation
