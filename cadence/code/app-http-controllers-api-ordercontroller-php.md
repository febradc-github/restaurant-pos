---
type: file
tags: [code/backend]
aliases: ["app/Http/Controllers/Api/OrderController.php"]
created: 2026-07-14
updated: 2026-07-16
related: ["[[app-services-checkout-paymentconfirmationservice-php]]", "[[app-services-receipts-printagentclient-php]]", "[[app-models-order-php]]", "[[app-models-orderitem-php]]", "[[app-enums-orderstatus-php]]", "[[US-7]]", "[[US-39]]"]
sources: []
---

# app/Http/Controllers/Api/OrderController.php

REST controller for orders. Constructor-injects PaymentConfirmationService and PrintAgentClient. Added two actions for C-7:
- `checkout(PATCH /api/orders/{order}/checkout)`: requires role:cashier, validates payment_method enum, confirms payment, sends receipt, returns order + print_status ('printed'|'failed'). 409 if already Paid/Cancelled. 422 on invalid method.
- `cancel(POST /api/orders/{order}/cancel)`: requires role:cashier, marks status=Cancelled. 409 if already Paid/Cancelled.

## Changes (C-39)

`store()` now validates `items.*.notes => ['nullable','string','max:500']` and passes notes through to `$order->items()->create([...])` payload. Each line item's notes field persists independently; the front-end currently submits the same note text for all items in an order (see [[frontend-src-components-ordertaking-tsx|OrderTaking.tsx]] for implementation details).

## Exports
- `checkout(Order $order, Request $request): JsonResponse` -- payment confirmation + receipt
- `cancel(Order $order): JsonResponse` -- order cancellation
- `store(Request $request): JsonResponse` -- create order with items (C-39: adds notes validation)

## Imports
- [[app-services-checkout-paymentconfirmationservice-php|app/Services/Checkout/PaymentConfirmationService.php]] -- payment logic
- [[app-services-receipts-printagentclient-php|app/Services/Receipts/PrintAgentClient.php]] -- receipt printing
- `app/Models/Order` -- Eloquent model
- [[app-models-orderitem-php|app/Models/OrderItem]] -- line items
- `app/Enums/PaymentMethod` -- validated against request
- `app/Enums/OrderStatus` -- status transitions
- `Illuminate/Http/Request`, `JsonResponse` -- Laravel HTTP

## Used by
- routes/api.php -- order CRUD routes mapped
- Frontend via GET /api/orders, POST /api/orders, PATCH /api/orders/{id}/checkout, POST /api/orders/{id}/cancel
