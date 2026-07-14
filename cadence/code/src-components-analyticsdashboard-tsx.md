---
type: file
tags: [code/frontend]
aliases: ["src/components/AnalyticsDashboard.tsx"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[src-api-analytics-ts]]", "[[src-api-restock-ts]]", "[[src-api-timeentries-ts]]", "[[src-types-analytics-ts]]", "[[src-types-restock-ts]]", "[[src-types-timeentry-ts]]", "[[src-components-salestrendchart-tsx]]", "[[src-components-attendanceaggregation-ts]]", "[[src-components-ownerpage-tsx]]", "[[restock-patch-response-gotcha]]", "[[US-24]]", "[[US-25]]", "[[US-26]]"]
sources: []
---

# src/components/AnalyticsDashboard.tsx

Owner Analytics Dashboard screen (C-26): mounted at /owner/analytics via OwnerPage routing. Composes four data-driven tables plus a sales trend chart, all scoped by a shared antd RangePicker date range control (Today/7/30/90-day presets). Restock inventory management is intentionally out-of-scope for date filtering.

## Exports
- `AnalyticsDashboard` -- React.FC<{session: AuthSession}>

## Imports
- `src/types/auth` -- AuthSession type
- `src/api/analytics`, `src/api/restock`, `src/api/timeEntries` -- API client factories
- `src/types/analytics`, `src/types/restock`, `src/types/timeEntry` -- data types
- [[src-components-salestrendchart-tsx|src/components/SalesTrendChart.tsx]] -- sales trend visualization
- [[src-components-attendanceaggregation-ts|src/components/attendanceAggregation.ts]] -- aggregates time entries
- `antd` -- Table, RangePicker, Tag, Button, Spin, message, Button (editable cell support)
- `dayjs` -- RangePicker value type and date presets
- React, useState, useEffect
- Associated CSS: AnalyticsDashboard.css

## Composed Views
1. **Sales Trend Chart** -- [[src-components-salestrendchart-tsx|SalesTrendChart]] fed by analytics.sales(from, to)
2. **Best/Worst Sellers Table** -- antd Table, sortable by quantity_sold/revenue (revenue-desc default), displays analytics.menuItems()
3. **Attendance Table** -- antd Table, displays aggregated time entries (attendanceAggregation.aggregateAttendance), shows total hours + in-progress count + auto-closed count
4. **Inventory Restock Table** -- antd Table with editable threshold column (MenuManager pattern), Tag+icon status for shortfall, displays restock.list()

## Date Range Handling
- Shared RangePicker at top scopes sales, best-seller, and attendance queries together with Today/7/30/90-day presets
- Restock list fetches once on mount in a separate effect; intentionally not date-scoped

## Used by
- [[src-components-ownerpage-tsx|src/components/OwnerPage.tsx]] -- nested route `/owner/analytics`

## Notes
See [[restock-patch-response-gotcha]] for the critical gotcha when handling restock threshold updates: the PATCH response is a bare InventoryItem without suggested_threshold/shortfall, so state merging (not wholesale replacement) is mandatory to preserve those fields across subsequent renders.
