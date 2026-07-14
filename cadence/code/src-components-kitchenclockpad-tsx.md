---
type: file
tags: [code/frontend]
aliases: ["src/components/KitchenClockPad.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-kitchenclockpad-css]]", "[[src-components-kitchenclockpad-test-tsx]]", "[[src-components-kitchendisplay-tsx]]", "[[frontend-src-api-kitchenclock-ts]]", "[[frontend-src-types-kitchenclock-ts]]", "[[US-12]]", "[[US-19]]", "[[EP-14]]"]
sources: []
---

# src/components/KitchenClockPad.tsx

PIN-based clock in/out panel overlay for kitchen staff (C-12). Rebuilt with Ant Design (C-19): toggle button and numeric keypad digits are now `Button size="large"`, with CSS giving each key a 3.5rem minimum touch target—deliberately larger than typical touch targets since kitchen staff may have wet or gloved hands. The panel is now an antd `Card`. Confirmation/error messaging uses `Alert`, with the confirmation using the `role="status"` override pattern established in C-18 (antd `Alert` defaults to `role="alert"` but an explicit `role` prop wins).

## Role

Renders as an independent, non-blocking overlay on the KitchenDisplay. PIN entry logic, the clock-in/out toggle state, and its independence from KitchenDisplay's own state are all unchanged from C-12 — opening/using the PIN pad must never disturb the order list. All 7 pre-existing tests pass unmodified, confirming the interaction logic itself was untouched.

## Exports
- `KitchenClockPad()` -- clock in/out overlay component

## Imports
- [[src-components-kitchenclockpad-css|src/components/KitchenClockPad.css]] -- styling
- [[frontend-src-api-kitchenclock-ts|src/api/kitchenClock.ts]] -- POST /api/kitchen-clock (clock in/out endpoint)
- [[frontend-src-types-kitchenclock-ts|src/types/kitchenClock.ts]] -- KitchenClockRequest, KitchenClockResponse types
- `antd` -- Card, Button (size="large"), Alert, Row, Col, Input
- `react` -- hooks

## Used by
- [[src-components-kitchendisplay-tsx|src/components/KitchenDisplay.tsx]] -- rendered as PIN-based clock in/out overlay
