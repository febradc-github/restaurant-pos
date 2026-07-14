---
type: file
tags: [code/frontend]
aliases: ["frontend/src/types/kitchenClock.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[frontend-src-api-kitchenclock-ts]]", "[[src-components-kitchenclockpad-tsx]]", "[[US-12]]", "[[US-19]]", "[[EP-10]]", "[[EP-14]]"]
sources: []
---

# frontend/src/types/kitchenClock.ts

TypeScript type definitions for kitchen clock endpoint response (C-12, rebuilt C-19).

## Exports
- `ClockResponse` -- response type: `{ name: string, status: 'clocked_in' | 'clocked_out' }`

## Used by
- [[src-components-kitchenclockpad-tsx|src/components/KitchenClockPad.tsx]] -- PIN-based clock in/out overlay
