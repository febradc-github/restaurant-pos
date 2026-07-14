---
type: file
tags: [code/frontend]
aliases: ["frontend/src/api/kitchenClock.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[frontend-src-types-kitchenclock-ts]]", "[[US-12]]", "[[EP-10]]"]
sources: []
---

# frontend/src/api/kitchenClock.ts

API client for POST /api/kitchen/clock endpoint (C-12). No authentication token required.

## Exports
- `clockInOut(pin: string): Promise<ClockResponse>` -- submits PIN to server, returns employee name and new clock status (in/out).
