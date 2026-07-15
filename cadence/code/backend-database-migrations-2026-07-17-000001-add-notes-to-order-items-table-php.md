---
type: file
tags: [code/backend, backend/database]
aliases: ["backend/database/migrations/2026_07_17_000001_add_notes_to_order_items_table.php"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[app-models-orderitem-php]]", "[[app-http-controllers-api-ordercontroller-php]]", "[[backend-database-migrations-2026-07-16-000001-add-zone-to-tables-table-php]]", "[[US-39]]"]
sources: []
---

# backend/database/migrations/2026_07_17_000001_add_notes_to_order_items_table.php

Additive migration for C-39: adds a nullable `notes` string column to `order_items` table. Follows the same pattern as C-37's zone migration ([[backend-database-migrations-2026-07-16-000001-add-zone-to-tables-table-php|2026_07_16_000001]]).

## Schema change

- **Column**: `notes` (nullable, string, max 500 chars enforced by controller validation)
- **Purpose**: Persist kitchen notes submitted per order. The front-end submits a single order-level note that gets copied onto every line item.
- **Backward compatibility**: Nullable, so existing order_items remain unaffected.

## Notes

Kitchen-note values are semantically order-level (all items in an order carry the same note), but persisted on the order_items table per the spec requirement. Any future feature reading these notes should account for this: expect all of an order's items to share the same note text, not independent per-item values.
