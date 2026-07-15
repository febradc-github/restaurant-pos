---
type: file
tags: [code/frontend, code/testing]
aliases: ["frontend/src/components/TableLayoutEditor.test.tsx"]
created: 2026-07-15
updated: 2026-07-16
related: ["[[frontend-src-components-TableLayoutEditor-tsx]]", "[[frontend-src-components-tableZoneGrouping-ts]]", "[[src-api-tables-ts]]", "[[US-37]]", "[[US-31]]"]
sources: []
---

# frontend/src/components/TableLayoutEditor.test.tsx

Test suite for TableLayoutEditor component. Fully rewritten in C-37 (14 tests); prior C-31 regression test removed.

## Test Coverage (C-37)

- **Fetch and display**: lists tables correctly, handles loading and error states
- **Stat row**: displays correct table count, total seats, and occupied count
- **Zone grouping**: tables grouped by zone with "Unassigned" sorted last
- **Color-coding**: verifies green (`colorSuccessBg`) for available, red (`colorErrorBg`) for occupied
- **Read-only gating**: no add form or edit controls when `authToken` is absent
- **Add with zone**: creates a table with optional zone value
- **Detail panel**: shows/hides correctly, displays Shape/Seats/Zone/Server fields, handles edit/duplicate/remove actions
- **Fetch error handling**: displays and dismisses error alerts

## Coverage notes

- Tests assert against CSS class names, `style.background` values (theme token diffing), and testid/heading presence
- No browser/screenshot verification available (see [[c37-browser-screenshot-testing-gap]])
- Zone grouping logic extracted to `tableZoneGrouping.ts` with its own test suite

## Related Work
- US-31: prior regression test for accessible heading (removed in C-37 rewrite)
- US-37: full redesign from canvas drag/resize to card-grid UI
