---
type: domain
tags: [code/frontend]
aliases: []
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-utils-currency-ts]]", "[[frontend-src-components-checkouthelpers-ts]]"]
sources: []
---

# Shared Cross-Component Utils Directory Pattern

Established convention in this codebase: extracted logic lives in a tested sibling module next to the component that uses it (tableZoneGrouping.ts next to TableLayoutEditor.tsx; salesTrendChartMath.ts and attendanceAggregation.ts from earlier tickets).

C-38 broke this pattern deliberately: `frontend/src/utils/` is a new top-level directory created for the first genuinely cross-cutting helper (**formatCurrency**, used by Checkout, should eventually be adopted by Analytics).

Previously this codebase had no shared cross-component utils directory. Going forward:
- **Single-component helpers**: keep colocated in a .ts sibling next to the component
- **Genuinely cross-component helpers** (reused or designed for reuse): place in frontend/src/utils/

This pattern clarifies intent and discoverability — a util/ helper signals "this is meant to be shared" vs. a sibling module which signals "this supports one component right now."
