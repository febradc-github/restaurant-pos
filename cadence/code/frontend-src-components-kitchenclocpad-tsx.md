---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/KitchenClockPad.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[frontend-src-api-kitchenclock-ts]]", "[[frontend-src-types-kitchenclock-ts]]", "[[src-components-kitchendisplay-tsx]]", "[[US-12]]", "[[EP-10]]"]
sources: []
---

# frontend/src/components/KitchenClockPad.tsx

React component: numeric PIN-pad overlay for kitchen staff clock in/out (C-12). Independent overlay element, does not block or replace the order list.

## UI

9-digit pad (0–9), Clear button (resets entry), Submit button (posts PIN to /api/kitchen/clock). On success, shows brief confirmation: employee name + "Clocked In" or "Clocked Out". On error, shows generic error message. Auto-resets after confirmation or error.

## Styling

Paired CSS file (KitchenClockPad.css). Designed as an independent, non-blocking element (layout integration into KitchenDisplay is simple DOM insertion).

## Integration

Used by KitchenDisplay.tsx to provide clock in/out capability alongside the order list.
