---
type: process
tags: [backend/database, pos]
aliases: ["Analytics API decimal convention", "analytics-response-decimal-string"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[laravel-decimal-json-serialization-gotcha]]", "[[app-http-controllers-api-analyticscontroller-php]]", "[[US-24]]", "[[US-26]]"]
sources: []
---

# Analytics API response format: decimal fields as strings (C-24)

All revenue fields in the Analytics API endpoints (GET /api/analytics/sales and GET /api/analytics/menu-items) are serialized as fixed-2-decimal strings, not JavaScript numbers, to preserve decimal precision across JSON round-trips. This is consistent with the existing [[laravel-decimal-json-serialization-gotcha]] pattern established for MenuItem.price in earlier tickets.

## Affected Endpoints

- **GET /api/analytics/sales** -- returns `[{ date: "YYYY-MM-DD", revenue: "123.45" }]`
- **GET /api/analytics/menu-items** -- returns `[{ menu_item_id: number, name: string, quantity_sold: number, revenue: "123.45" }]`

## Frontend TypeScript Impact

C-26 (Analytics Dashboard UI) must type both `revenue` fields as `string`, not `number`. Do not parse with parseFloat() or perform arithmetic unless actually needed—it defeats the precision gain.

Example:
```typescript
interface SalesMetric {
  date: string;     // "2026-07-01"
  revenue: string;  // "1250.50", not number
}

interface MenuItemMetric {
  menu_item_id: number;
  name: string;
  quantity_sold: number;
  revenue: string;  // "420.00", not number
}
```

Display revenue directly in templates; for re-sorting by revenue, string comparison works correctly for fixed-2-decimal strings (e.g., "100.00" < "20.00" is false, correct behavior).

## Backend Implementation (C-24)

Revenue is computed as number_format(sum(quantity * menu_item.price), 2), mirroring PrintAgentClient::payloadFor()'s order-total pattern. No bcmath or alternative money library—consistent with existing codebase convention.
