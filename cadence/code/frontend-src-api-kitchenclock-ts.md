---
type: file
tags: [code/frontend]
aliases: ["frontend/src/api/kitchenClock.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[frontend-src-types-kitchenclock-ts]]", "[[src-components-kitchenclockpad-tsx]]", "[[src-components-kitchendisplay-tsx]]", "[[US-12]]", "[[US-19]]", "[[EP-10]]", "[[EP-14]]"]
sources: []
---

# frontend/src/api/kitchenClock.ts

API client for POST /api/kitchen-clock endpoint (C-12, rebuilt C-19). No authentication token required. Called by KitchenClockPad for PIN-based clock in/out.

## Exports
- `clockInOut(pin: string): Promise<ClockResponse>` -- submits PIN to server, returns employee name and new clock status (in/out).

## Used by
- [[src-components-kitchenclockpad-tsx|src/components/KitchenClockPad.tsx]] -- PIN-based clock in/out overlay
