---
type: file
tags: [code/backend]
aliases: ["app/Enums/PaymentMethod.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-services-checkout-paymentconfirmationservice-php]]", "[[app-http-controllers-api-ordercontroller-php]]", "[[US-7]]"]
sources: []
---

# app/Enums/PaymentMethod.php

Backed enum for payment methods: Cash, QrPh (Philippine QR code), GCash (Philippine e-wallet). Used in PaymentConfirmationService and Order.payment_method cast.

## Exports
- `PaymentMethod` enum -- Cash, QrPh, GCash cases

## Used by
- [[app-services-checkout-paymentconfirmationservice-php|app/Services/Checkout/PaymentConfirmationService.php]] -- validated against request
- [[app-http-controllers-api-ordercontroller-php|app/Http/Controllers/Api/OrderController.php]] -- checkout() validates enum
- [[app-models-order-php|app/Models/Order.php]] -- payment_method cast
