---
type: file
tags: [code/frontend]
aliases: ["src/components/KitchenClockPad.test.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-kitchenclockpad-tsx]]", "[[US-12]]", "[[US-19]]", "[[EP-14]]"]
sources: []
---

# src/components/KitchenClockPad.test.tsx

Test suite for KitchenClockPad component. All 7 pre-existing tests pass unmodified against the Ant Design rebuild (C-19), confirming the PIN entry logic and clock-in/out toggle behavior remain unchanged. Tests verify coexistence with KitchenDisplay without interference to order list state.

## Exports
(None; test file.)

## Imports
- [[src-components-kitchenclockpad-tsx|src/components/KitchenClockPad.tsx]] -- component under test
- `vitest`, `testing-library/react` -- test harness and utilities
