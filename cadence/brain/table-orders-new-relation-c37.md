---
type: domain
tags: [backend]
aliases: []
created: 2026-07-16
updated: 2026-07-16
related: ["[[backend-app-models-table-php]]", "[[backend-app-http-controllers-api-tablecontroller-php]]", "[[C-37]]"]
sources: []
---

# Table.orders() Relation – New in C-37

Prior to C-37, `Table` and `Order` models were connected only via `Order.table_id` foreign key with no inverse Eloquent relation defined. This forced every query needing table-order joins to use raw/manual querying.

**C-37 adds**: `public function orders(): HasMany` to the Table model, enabling:
- `$table->orders()->where('status', Pending)->exists()` in future queries
- Relationship eager loading and querying patterns (`with()`, `whereHas()`, `withExists()`, etc.)
- The centralized occupancy computation in `TableController@index`: `Table::withExists(['orders as is_occupied' => fn($q) => $q->whereIn('status', [Pending, Ready])])`

Any future ticket needing to join tables to orders or filter by order status should use this relation rather than duplicating the table-order linking logic. See the `Order` model for the inverse foreign-key definition.
