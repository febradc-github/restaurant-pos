---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/Analytics/AnalyticsMenuItemsTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-http-controllers-api-analyticscontroller-php]]", "[[app-models-order-php]]", "[[US-24]]"]
sources: []
---

# backend/tests/Feature/Analytics/AnalyticsMenuItemsTest.php

Feature tests for GET /api/analytics/menu-items endpoint.

## Tests (6)
- Authorization: requires auth:sanctum + role:owner (unauthenticated and non-owner roles are rejected)
- Non-Paid order exclusion: Pending/Cancelled orders do not contribute to quantity or revenue totals
- Quantity correctness: sum of order_items.quantity per menu_item matches response quantity_sold across multiple orders
- Revenue correctness: sum(quantity * menu_item.price) matches response revenue, formatted as fixed-2-decimal string
- Multi-item ranking: multiple menu items in response are sorted descending by revenue by default
- Range filtering: optional from/to query params filter by paid_at, inclusive on both sides (nullable-bounds style)

## Design
Uses Order and MenuItem factories with explicit paid_at timestamps and multiple order items per order to test aggregation and ranking logic independently of current time.
