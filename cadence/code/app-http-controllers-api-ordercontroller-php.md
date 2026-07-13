---
type: file
tags: [code/backend]
aliases: ["app/Http/Controllers/Api/OrderController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-services-checkout-paymentconfirmationservice-php]]", "[[app-services-receipts-printagentclient-php]]", "[[app-models-order-php]]", "[[app-enums-orderstatus-php]]", "[[US-7]]"]
sources: []
---

# app/Http/Controllers/Api/OrderController.php

REST controller for orders. Constructor-injects PaymentConfirmationService and PrintAgentClient. Added two actions for C-7:
- `checkout(PATCH /api/orders/{order}/checkout)`: requires role:cashier, validates payment_method enum, confirms payment, sends receipt, returns order + print_status ('printed'|'failed'). 409 if already Paid/Cancelled. 422 on invalid method.
- `cancel(POST /api/orders/{order}/cancel)`: requires role:cashier, marks status=Cancelled. 409 if already Paid/Cancelled.

## Exports
- `checkout(Order $order, Request $request): JsonResponse` -- payment confirmation + receipt
- `cancel(Order $order): JsonResponse` -- order cancellation

## Imports
- [[app-services-checkout-paymentconfirmationservice-php|app/Services/Checkout/PaymentConfirmationService.php]] -- payment logic
- [[app-services-receipts-printagentclient-php|app/Services/Receipts/PrintAgentClient.php]] -- receipt printing
- `app/Models/Order` -- Eloquent model
- `app/Enums/PaymentMethod` -- validated against request
- `app/Enums/OrderStatus` -- status transitions
- `Illuminate/Http/Request`, `JsonResponse` -- Laravel HTTP

## Used by
- routes/api.php -- checkout and cancel routes mapped
- Frontend via POST /api/orders/{id}/checkout, POST /api/orders/{id}/cancel
