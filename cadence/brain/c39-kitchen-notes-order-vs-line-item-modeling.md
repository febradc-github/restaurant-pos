---
type: domain
tags: [backend/database, frontend]
aliases: ["kitchen-note modeling", "order notes architecture"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[app-models-orderitem-php]]", "[[frontend-src-components-ordertaking-tsx]]", "[[backend-database-migrations-2026-07-17-000001-add-notes-to-order-items-table-php]]", "[[US-39]]"]
sources: []
---

# Kitchen-note modeling: order-level UX, order_items persistence (C-39)

The spec required notes to be persisted on order_items (plural, per-line-item). The actual Server UI presents a single order-level textarea — when submitted, that one note text is copied onto every line item's notes field in the request payload.

## Why this design

- **Backend requirement**: Data model mandates notes live on order_items table, not a new orders.notes column.
- **Server UX simplicity**: Kitchen staff think in terms of per-order notes, not per-item notes (e.g. "no onions on this whole order"). A single textarea is simpler than N per-item note inputs.
- **Backward compatibility**: Adding a column to order_items (nullable) doesn't break existing orders.

## Implications for future features

Any code that reads kitchen notes — such as a future KitchenDisplay feature displaying notes on order cards — needs to understand that all of an order's line items will carry the *same* note text (or all null), even though the schema technically allows independent per-item values. Do not assume per-item independence; all items in an order should have identical note content.

## Related

The modeling choice splits the API contract (notes on line items) from the UX flow (one note field). This is acceptable because the note semantics are order-level even if the persistence is per-item.
