---
type: file
tags: [code/backend]
aliases: ["app/Services/Checkout/PaymentConfirmationService.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-services-receipts-printagentclient-php]]", "[[app-http-controllers-api-ordercontroller-php]]", "[[app-enums-paymentmethod-php]]", "[[adr-005-manual-payment-confirmation]]", "[[US-7]]"]
sources: []
---

# app/Services/Checkout/PaymentConfirmationService.php

Isolated unit for manual payment confirmation (ADR-005). Marks an order as paid: sets payment_method, paid_at=now(), status=Paid. Deliberately separated from checkout orchestration so a future live payment gateway integration (QR Ph API, Xendit, etc.) only touches this class, leaving OrderController and receipt logic untouched.

## Exports
- `confirm(Order $order, PaymentMethod $method): Order` -- sets payment fields, updates status to Paid, saves, returns modified order

## Imports
- `app/Models/Order` -- Eloquent model
- `app/Enums/PaymentMethod` -- payment method enum
- `app/Enums/OrderStatus` -- status enum

## Used by
- [[app-http-controllers-api-ordercontroller-php|app/Http/Controllers/Api/OrderController.php]] -- called in checkout() action
