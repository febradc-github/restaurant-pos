---
type: file
tags: [code/frontend]
aliases: ["src/api/analytics.ts"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[src-types-analytics-ts]]", "[[src-components-analyticsdashboard-tsx]]", "[[app-http-controllers-api-analyticscontroller-php]]", "[[US-24]]", "[[US-26]]"]
sources: []
---

# src/api/analytics.ts

Frontend API client for analytics endpoints, following the same factory pattern as the employees API. Owner-gated backend (C-24).

## Exports
- `createAnalyticsApi({baseUrl, token})` -- factory function returning the client object
  - `sales(from?: string, to?: string): Promise<SalesMetric[]>` -- GET /api/analytics/sales, with optional date range
  - `menuItems(from?: string, to?: string): Promise<MenuItemMetric[]>` -- GET /api/analytics/menu-items, with optional date range

## Imports
- `src/types/analytics` -- SalesMetric, MenuItemMetric types
- `fetch` (built-in)

## Used by
- [[src-components-analyticsdashboard-tsx|src/components/AnalyticsDashboard.tsx]] -- fetches sales and menu items metrics for dashboard display
