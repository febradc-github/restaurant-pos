---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/AnalyticsDashboard.tsx"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[US-31]]"]
sources: []
---

# frontend/src/components/AnalyticsDashboard.tsx

Analytics and business metrics section of the Owner Console. Displays dashboards, charts, and KPIs for restaurant operations.

## Changes (C-31)

Replaced raw `<h2>` page heading with `Typography.Title level={2}` to align with antd theming and avoid CSS inheritance from index.css boilerplate. This ensures consistent typography and proper theme token application across admin pages.

## Exports
- `AnalyticsDashboard` (component) -- analytics and business metrics dashboard

## Imports
- `Typography` from `antd` -- for properly themed heading
- (other antd components for chart/stat display)

## Used by
- [[frontend-src-components-OwnerPage-tsx|OwnerPage.tsx]] -- rendered as a section within Owner Console
