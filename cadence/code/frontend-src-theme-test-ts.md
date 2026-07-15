---
type: file
tags: [code/frontend, code/testing]
aliases: ["frontend/src/theme.test.ts"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[US-36]]", "[[frontend-src-theme-ts]]"]
sources: []
---

# frontend/src/theme.test.ts

Test suite for theme.ts dark theme configuration (C-36). Asserts three invariants of the dark theme via computed relative-luminance and WCAG contrast-ratio helpers: (1) surfaces resolve to dark, near-black backgrounds (luminance <0.05); (2) colorPrimary stays in the terracotta/burnt-orange family (red-leaning, warm hue); (3) colorPrimary achieves WCAG minimum contrast (3:1 for UI components, 4.5:1 for normal text on primary fills) against both layout and container backgrounds.

The test implements hexToRgb, relativeLuminance (WCAG linear formula), and contrastRatio helpers inline rather than importing them, keeping the test file self-contained and the contrast math explicit.

## Exports
- Test cases only (no named exports)

## Imports
- `vitest` -- test runner
- `antd` (theme, getDesignToken) -- theme resolution utilities
- `[[frontend-src-theme-ts|frontend/src/theme.ts]]` -- theme config under test
