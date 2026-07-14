---
type: file
tags: [code/backend]
aliases: ["backend/app/Http/Controllers/Api/AnalyticsController.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-order-php]]", "[[routes-api-php]]", "[[US-24]]", "[[EP-23]]"]
sources: []
---

# backend/app/Http/Controllers/Api/AnalyticsController.php

Owner-gated analytics endpoints for sales trends and best-selling menu items. All responses computed only from Paid orders, dated by paid_at.

## Exports
- `sales(Request)` -- GET /api/analytics/sales, role:owner-gated. Returns daily revenue aggregation within optional from/to range.
- `menuItems(Request)` -- GET /api/analytics/menu-items, role:owner-gated. Returns per-item quantity and revenue metrics, sortable by either dimension.

## Query Parameters (all optional)
- `from` -- date string (YYYY-MM-DD), validated; filters on `paid_at >= from 00:00:00`
- `to` -- date string (YYYY-MM-DD), validated; filters on `paid_at <= to 23:59:59` (normalized to end-of-day for inclusive same-date filtering)

## Response Format

**GET /api/analytics/sales**
```json
[
  { "date": "2026-07-01", "revenue": "1250.50" },
  { "date": "2026-07-02", "revenue": "890.00" }
]
```
Sorted ascending by date. Revenue is a fixed-2-decimal string, using number_format() (not bcmath, which this codebase does not use elsewhere for money).

**GET /api/analytics/menu-items**
```json
[
  { "menu_item_id": 5, "name": "Burger", "quantity_sold": 42, "revenue": "420.00" },
  { "menu_item_id": 3, "name": "Fries", "quantity_sold": 15, "revenue": "90.00" }
]
```
Sorted descending by revenue by default. Both quantity and revenue present per item, allowing consumers to re-sort by either dimension. Revenue is a fixed-2-decimal string.

## Design

Uses Order model's chainable scopes (scopePaid, scopePaidBetween) to filter only Paid orders by paid_at. Revenue per menu item is computed as sum(quantity * menu_item.price), mirroring PrintAgentClient::payloadFor()'s order-total pattern. No bcmath or alternative money library—consistent with existing codebase convention.

## Imports
- app/Models/Order
- app/Models/MenuItem
- Laravel controller and validation traits
