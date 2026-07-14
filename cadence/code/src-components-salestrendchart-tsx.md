---
type: file
tags: [code/frontend]
aliases: ["src/components/SalesTrendChart.tsx"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[src-components-salestrendchartmath-ts]]", "[[src-components-analyticsdashboard-tsx]]", "[[hand-built-svg-chart-pattern]]", "[[frontend-bundle-size-code-splitting]]", "[[US-26]]"]
sources: []
---

# src/components/SalesTrendChart.tsx

Hand-built SVG line chart component (no charting library) for sales-over-time trend. Deliberate choice to avoid adding a charting dependency given antd's already-large bundle size. Component is a thin render + event-handling wrapper around the pure geometry in salesTrendChartMath.ts.

## Exports
- `SalesTrendChart` -- React.FC<{data: SalesMetric[], width?: number, height?: number}>

## Imports
- [[src-components-salestrendchartmath-ts|src/components/salesTrendChartMath.ts]] -- computeSalesChartLayout, nearestPointIndex
- `src/types/analytics` -- SalesMetric type
- `src/theme` -- theme colors (colorPrimary for line, surface colors for grid and end-marker ring)
- React
- Associated CSS: SalesTrendChart.css

## Styling (SalesTrendChart.css)
- 2px round-joined line in theme colorPrimary
- Hairline (1px) solid gridlines one step off surface color
- End-marker dot: >=8px diameter, surface-color ring with colorPrimary center
- Pointermove-driven crosshair: thin vertical hairline + tooltip
- Tooltip text: date in secondary text color (label), revenue bold in primary text color (value)
- Text is never series-colored; labels use secondary/primary hierarchy per dataviz house style

## Used by
- [[src-components-analyticsdashboard-tsx|src/components/AnalyticsDashboard.tsx]] -- renders sales trend section of dashboard

## Notes
This component exemplifies the hand-built SVG chart pattern: no library dependency, geometry math in pure TS, React only for rendering and event dispatch. See [[hand-built-svg-chart-pattern]] for rationale, reuse guidance, and the house style spec that applies to any future custom chart in this app.
