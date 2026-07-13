---
type: file
tags: [code/backend]
aliases: ["database/migrations/2026_07_14_000009_create_order_items_table.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[database-migrations-2026_07_14_000008_create_orders_table-php]]"]
sources: []
---

# database/migrations/2026_07_14_000009_create_order_items_table.php

Creates the `order_items` table for line items within orders (C-6).

## Schema

- `id` -- primary key
- `order_id` -- foreign key to orders, cascade-delete
- `menu_item_id` -- foreign key to menu_items (not nullable)
- `quantity` -- unsigned integer, default 1
- `created_at`, `updated_at` -- timestamps
