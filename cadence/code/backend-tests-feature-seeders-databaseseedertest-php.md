---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/Seeders/DatabaseSeederTest.php"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[TK-27]]", "[[backend-database-seeders-databaseseeder-php]]", "[[app-models-user-php]]", "[[app-models-order-php]]", "[[app-models-inventoryitem-php]]", "[[app-models-timeentry-php]]"]
sources: []
---

# backend/tests/Feature/Seeders/DatabaseSeederTest.php

Feature test suite (7 tests, 21 assertions) verifying the DatabaseSeeder produces the expected complete demo dataset. Validates user credentials, role assignments, inventory thresholds, order payment data, and time_entry coverage for the seeded role users.

## Exports

- `test_*` -- 7 test methods exercising the full seeder output:
  - Users: Owner/Cashier/Server with email+password credentials exist and are active
  - Kitchen users: two users with 6-digit PIN credentials exist and are active
  - Inventory: at least one item has `stock < threshold` (restock shortfall for Analytics Dashboard)
  - Orders: at least one `Paid` order exists with `paid_at` set (feeds sales/best-seller analytics)
  - TimeEntries: exist for seeded Server/Cashier/Kitchen users (supplies Attendance view data)

## Imports

- `PHPUnit\Framework\TestCase` -- test framework
- `Illuminate\Foundation\Testing\RefreshDatabase` -- trait for test isolation
- `App\Models\*` -- User, Order, InventoryItem, TimeEntry (Laravel models)

## Used by

- `php artisan test backend/tests/Feature/Seeders/DatabaseSeederTest.php` -- validate seeder output in CI/development
