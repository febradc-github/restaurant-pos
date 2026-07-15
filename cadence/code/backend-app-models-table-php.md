---
type: file
tags: [code/backend]
aliases: ["backend/app/Models/Table.php"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[backend-app-http-controllers-api-tablecontroller-php]]", "[[backend-database-migrations-2026-07-16-000001-add-zone-to-tables-table-php]]", "[[C-37]]"]
sources: []
---

# backend/app/Models/Table.php

Eloquent model for restaurant floor-plan tables. Represents a physical table with shape, capacity, zone, and canvas position/size.

## Schema

- `id` (primary key)
- `label` (string) -- display name, e.g. "Table 5" or "Patio Corner"
- `shape` (enum: round/square/rectangular) -- casting to `TableShape` enum
- `capacity` (integer) -- seat count
- `zone` (string, nullable) -- C-37: floor-plan area this table belongs to (e.g., "Patio", "Bar"), or null if unassigned
- `x`, `y`, `width`, `height` (floats) -- canvas position/size; kept vestigial (C-37) but still part of the schema
- timestamps (created_at, updated_at)

## Relations

- `orders()`: HasMany relation to Order model (C-37, new). Every order ever placed for this table, occupied or not. Replaces ad-hoc foreign-key querying. Used by TableController@index to derive `is_occupied` via `withExists(['orders as is_occupied' => ...])`.

## Fillable attributes

C-37: `zone` added to the fillable list. All attributes: `['label', 'shape', 'capacity', 'zone', 'x', 'y', 'width', 'height']`

## Casting

- `shape` -> `TableShape` enum
- `capacity` -> integer
- `x`, `y`, `width`, `height` -> floats

## Exports
- `Table` model class with `orders()` relation and fillable attributes

## Imports
- `TableShape` enum -- shape attribute casting
- `HasMany`, `Model`, `HasFactory`, `Fillable` from Laravel -- Eloquent base and traits
- `TableFactory` from database factories -- factory for testing

## Used by
- [[backend-app-http-controllers-api-tablecontroller-php|TableController]] -- CRUD operations, `withExists()` for occupancy
- Order model -- inverse relation (table_id foreign key)
- Frontend API consumers (Owner table grid, etc.)
- Tests: backend/tests/Feature/Tables/TableLayoutTest.php
