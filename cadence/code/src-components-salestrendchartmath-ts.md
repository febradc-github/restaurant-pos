---
type: file
tags: [code/frontend]
aliases: ["src/components/salesTrendChartMath.ts"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[src-components-salestrendchart-tsx]]", "[[hand-built-svg-chart-pattern]]", "[[US-26]]"]
sources: []
---

# src/components/salesTrendChartMath.ts

Pure geometry and math helpers extracted from SalesTrendChart.tsx for unit testability and to isolate React-free logic. No React or DOM dependency.

## Exports
- `computeSalesChartLayout(data: SalesMetric[], pixelWidth: number, pixelHeight: number)` -- given data points and pixel dimensions, computes {x, y} screen coordinates for each point and returns layout metadata
- `nearestPointIndex(pointerX: number, points: Array<{x: number, y: number}>)` -- given a pointer x-coordinate, returns the index of the nearest data point (used for crosshair tracking)

## Imports
(none)

## Used by
- [[src-components-salestrendchart-tsx|src/components/SalesTrendChart.tsx]] -- uses both functions to compute SVG coordinates and handle pointermove events

## Notes
This split follows the hand-built SVG chart pattern. See [[hand-built-svg-chart-pattern]] for rationale and reuse guidance.
