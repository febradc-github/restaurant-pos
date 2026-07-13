---
type: file
tags: [code/backend]
aliases: ["database/migrations/2026_07_14_000005_create_menu_items_table.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-menuitem-php]]", "[[US-4]]"]
sources: []
---

# database/migrations/2026_07_14_000005_create_menu_items_table.php

Laravel migration creating the menu_items table: id, name (string), price (decimal 10,2), category_id (FK to categories with restrictOnDelete), available (boolean, default true), timestamps. Cascade delete prevented by design—destroy returns 409 if category still has items.

## Exports
- `up()` -- creates menu_items table with FK constraint
- `down()` -- drops menu_items table