---
type: file
tags: [code/backend]
aliases: ["database/migrations/2026_07_14_000008_create_orders_table.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[database-migrations-2026_07_14_000009_create_order_items_table-php]]"]
sources: []
---

# database/migrations/2026_07_14_000008_create_orders_table.php

Creates the `orders` table for C-6 (Order Taking & Kitchen Display).

## Schema

- `id` -- primary key
- `table_id` -- foreign key to tables (not nullable; every order belongs to a table)
- `status` -- string, default 'pending' (cast to OrderStatus enum at the model level)
- `created_at`, `updated_at` -- timestamps
