---
type: file
tags: [code/backend]
aliases: ["backend/database/seeders/DatabaseSeeder.php"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[TK-27]]", "[[app-models-user-php]]", "[[app-models-order-php]]", "[[app-models-timeentry-php]]", "[[database-factories-userfactory-php]]", "[[database-factories-orderfactory-php]]", "[[database-factories-timeentryfactory-php]]"]
sources: []
---

# backend/database/seeders/DatabaseSeeder.php

Replaces the Laravel default seeder stub with a complete demo dataset for development and testing. Seeds in dependency order: 5 users (one Owner, one Cashier, one Server, two Kitchen users), menu categories and items, inventory items with realistic stock levels and thresholds, tables, sample orders across the last 30 days, and time_entries for role users. All seeded entities use `firstOrCreate` patterns to allow safe re-runs without unique-constraint violations or duplicates. Prints all user credentials to console via `$this->command->info()`.

## Exports

- `run()` -- entry point invoked by `php artisan db:seed`. Seeds in order: (1) 5 users with fixed, documented credentials (`owner@demo.pos`/`password`, `cashier@demo.pos`/`password`, `server@demo.pos`/`password`, two Kitchen users by PIN `111111` and `222222`), all `active`; (2) 4 menu categories and 11 menu items with prices, all available; (3) 6 inventory items linked to menu items via `menu_item_inventory_item` pivot with realistic `quantity_required` values; (4) 6 tables with mixed shapes/capacities; (5) guarded seed of 45 orders spread across the last 30 days (41 `Paid` with `paid_at` set, remaining mix of `Pending`/`Ready`/`Cancelled` without `paid_at`) with 97 `OrderItem` rows; (6) guarded seed of 10 `time_entries` across Server/Cashier/Kitchen users, including normally-closed shifts, one open entry, and one `auto_closed` entry. Credentials printed to console for easy reference.

## Imports

- `Illuminate\Database\Console\Seeds\WithoutModelEvents` -- trait for seeder
- `Illuminate\Database\Seeder` -- base seeder class
- `App\Models\*` -- User, Category, MenuItem, InventoryItem, Table, Order, OrderItem, TimeEntry (Laravel models)

## Used by

- `database/seeders/DatabaseSeeder.php` artisan seeder invocation (development/testing workflow)
- [[backend-tests-feature-seeders-databaseseedertest-php|backend/tests/Feature/Seeders/DatabaseSeederTest.php]] -- verifies seeded data structure and credentials
