---
type: domain
tags: [code/frontend, frontend/performance]
aliases: ["custom SVG chart", "no-library chart pattern"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[frontend-bundle-size-code-splitting]]", "[[src-components-salestrendchart-tsx]]", "[[src-components-salestrendchartmath-ts]]", "[[US-26]]"]
sources: []
---

# Hand-built SVG chart over a charting library (single-series trend pattern)

C-26 (SalesTrendChart) and an earlier precedent in C-15+ have demonstrated that building a single-series trend chart by hand as SVG is lighter and more appropriate than adding a charting library dependency. This project's antd bundle is already flagged for size concern per [[frontend-bundle-size-code-splitting]].

## Pattern

Extract all pure geometry and math into a `.ts` file with no React or DOM dependency:
- Compute {x, y} screen coordinates for each data point given pixel width/height
- Compute nearest-point-to-pointer lookup (for crosshair/tooltip tracking)
- Keep all logic testable in unit tests

Keep the `.tsx` file as a thin render + event-handling wrapper:
- Uses computed coords to render SVG elements
- Dispatches pointermove/pointerleave to update UI state
- Exports the React component only (per oxlint's react/only-export-components rule)

## When to Use

- Single-series line/area trends (sales over time, page views, etc.)
- Custom visualizations with specific styling or interaction needs
- When a library dependency would increase bundle size unnecessarily

Do not use for:
- Multi-series comparisons (use a library)
- Complex interactive features (legend, brushing, etc.)
- Charts where the team lacks SVG experience

## House Style (for consistency in future custom charts)

All custom SVG charts in this app should follow the same visual conventions:
- **Line:** 2px round-joined line in theme colorPrimary
- **Gridlines:** Hairline (1px) solid, one step off the surface color (e.g., subtle, not black on white)
- **End-marker dot:** >=8px diameter, surface-color ring with colorPrimary center
- **Crosshair + tooltip (on pointermove):**
  - Thin vertical hairline at pointer x-coordinate
  - Tooltip text: date/label in secondary text color, value bold in primary text color
  - Never color the value by series (keep it primary-colored for consistency)
- **Text overall:** Labels use secondary hierarchy, values use primary (never series-colored), follows dataviz skill rules

## Example (C-26)

[[src-components-salestrendchart-tsx|SalesTrendChart.tsx]]: 220 lines of React + SVG render + pointermove handler.
[[src-components-salestrendchartmath-ts|salesTrendChartMath.ts]]: 60 lines of pure coordinate math, independently testable.

Together, they prove a single-series trend chart needs no external charting library.

## Future Reuse

Before adding a charting library to the frontend, evaluate whether a hand-built SVG chart would meet the need (single series, specific styling required, lightweight desired). If reusing this pattern multiple times, consider extracting a higher-level "chart canvas" abstraction, but only then.
