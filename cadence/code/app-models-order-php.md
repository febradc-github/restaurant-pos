---
type: file
tags: [code/backend]
aliases: ["app/Models/Order.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-orderitem-php]]", "[[database-migrations-2026_07_14_000008_create_orders_table-php]]", "[[app-http-controllers-api-ordercontroller-php]]", "[[app-services-checkout-paymentconfirmationservice-php]]", "[[app-services-receipts-printagentclient-php]]", "[[US-7]]"]
sources: []
---

# app/Models/Order.php

Eloquent model for orders, tying menu selections to a table.

## Exports
- `table()` -- belongsTo Table
- `items()` -- hasMany OrderItem (cascade-delete on order delete)
- `$casts` -- status cast to OrderStatus enum; payment_method cast to PaymentMethod enum (C-7)
- `$fillable` -- includes payment_method, paid_at (C-7)

## Design

Orders are always tied to a table (table_id required). Status defaults to Pending and casts to the OrderStatus enum. C-7 added payment_method (string, one of PaymentMethod enum) and paid_at (nullable timestamp). Deletion is rare (most operations archive rather than hard-delete), but cascade to order_items is configured for safety.
