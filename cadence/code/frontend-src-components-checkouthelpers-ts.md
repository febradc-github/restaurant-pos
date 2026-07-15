---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/checkoutHelpers.ts"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-components-checkout-tsx]]", "[[frontend-src-components-tableZoneGrouping-ts]]", "[[src-components-salestrendchartmath-ts]]"]
sources: []
---

# frontend/src/components/checkoutHelpers.ts

Pure helpers extracted from Checkout.tsx (C-38). All functions are immutable, take no React dependencies, and are tested in a .test.ts sibling.

## Exports
- `elapsedTimeSinceCreatedAt(createdAt: string): string` -- returns human-readable elapsed time ("2 min ago", "1 hour ago", etc.)
- `isOrderFromToday(createdAt: string): boolean` -- checks if order's created_at is from today (client-side date comparison)
- `searchPredicate(query: string, order: Order): boolean` -- matches query against table label or any line item's menu item name (case-insensitive)
- `sortByCreatedAt(orders: Order[], direction: 'asc' | 'desc'): Order[]` -- sorts by created_at oldest/newest
- `orderTotal(order: Order): number` -- sums all line items' prices
- `LINE_ITEM_PREVIEW_COUNT` -- constant = 5 (truncation threshold for showing "+N more items" toggle)

## Pattern

Follows the existing codebase convention: pure logic colocated with its component but in a tested sibling module (same pattern as C-37's tableZoneGrouping.ts, and salesTrendChartMath.ts / attendanceAggregation.ts from earlier tickets).

## Testing

- frontend/src/components/checkoutHelpers.test.ts -- covers all helpers with Orders fixture
