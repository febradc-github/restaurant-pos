---
type: file
tags: [code/backend]
aliases: ["app/Models/Order.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-orderitem-php]]", "[[database-migrations-2026_07_14_000008_create_orders_table-php]]", "[[app-http-controllers-api-ordercontroller-php]]", "[[app-http-controllers-api-analyticscontroller-php]]", "[[app-services-checkout-paymentconfirmationservice-php]]", "[[app-services-receipts-printagentclient-php]]", "[[AR-chainable-query-scopes-for-analytics]]", "[[US-7]]", "[[US-24]]"]
sources: []
---

# app/Models/Order.php

Eloquent model for orders, tying menu selections to a table. Includes chainable query scopes for analytics filtering.

## Exports
- `table()` -- belongsTo Table
- `items()` -- hasMany OrderItem (cascade-delete on order delete)
- `$casts` -- status cast to OrderStatus enum; payment_method cast to PaymentMethod enum (C-7)
- `$fillable` -- includes payment_method, paid_at (C-7)

## Query Scopes (chainable, return Builder)
- `scopePaid(Builder $query)` -- filters status = OrderStatus::Paid (C-24)
- `scopePaidBetween(Builder $query, ?string $from, ?string $to)` -- filters paid_at within optional range, either side omittable for open-ended range; both inclusive, to-bound normalized to end-of-day (C-24)

## Design

Orders are always tied to a table (table_id required). Status defaults to Pending and casts to the OrderStatus enum. C-7 added payment_method (string, one of PaymentMethod enum) and paid_at (nullable timestamp). Deletion is rare (most operations archive rather than hard-delete), but cascade to order_items is configured for safety.

C-24 introduced analytics-oriented scopes mirroring TimeEntry's chainable pattern (forUser, forRole, clockedInBetween), enabling fluid query composition for revenue and best-seller aggregations. Scopes return Builder to enable chaining; consumers compose them with select(), groupBy(), and aggregate functions as needed.
