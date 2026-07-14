---
type: file
tags: [code/frontend]
aliases: ["src/types/analytics.ts"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[src-api-analytics-ts]]", "[[src-components-analyticsdashboard-tsx]]", "[[analytics-api-response-format-decimal-string-convention]]", "[[US-24]]", "[[US-26]]"]
sources: []
---

# src/types/analytics.ts

TypeScript types for analytics response data from backend Analytics API (C-24).

## Exports
- `SalesMetric` -- `{date: string, revenue: string}` where date is YYYY-MM-DD and revenue is fixed-2-decimal string per the analytics decimal convention
- `MenuItemMetric` -- `{menu_item_id: number, name: string, quantity_sold: number, revenue: string}` where revenue is fixed-2-decimal string

## Imports
(none)

## Used by
- [[src-api-analytics-ts|src/api/analytics.ts]] -- type signature for sales() and menuItems() return
- [[src-components-analyticsdashboard-tsx|src/components/AnalyticsDashboard.tsx]] -- typed props for data display

## Notes
Both revenue fields are strings (not numbers) to preserve decimal precision. See [[analytics-api-response-format-decimal-string-convention]] for rationale and display guidance.
