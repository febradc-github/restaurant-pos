---
type: file
tags: [code/frontend, code/testing]
aliases: ["frontend/src/components/OrderTaking.test.tsx"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-components-ordertaking-tsx]]", "[[US-39]]"]
sources: []
---

# frontend/src/components/OrderTaking.test.tsx

Comprehensive test suite for [[frontend-src-components-ordertaking-tsx|OrderTaking.tsx]]. 14 tests covering core behaviors and responsive layout.

## Test coverage

- **Mount + fetch (3 tests)**: Confirms three parallel API calls (categories, tables, menu-items) on mount; verifies no auth header is sent (adr-008 compliance).
- **Category grouping**: Menu items rendered under correct category section headers.
- **Category-chip filtering**: Tapping category filter chips correctly narrows the menu grid.
- **Search filtering**: Search textbox filters menu items by name in real time.
- **Table-chip selection + server-name tag**: Radio.Group selection of a table, and "Served by {serverName}" tag display beside selected chip.
- **Accent border on selected items**: Items with quantity > 0 show colorPrimary border (via theme.useToken()).
- **Summary panel contents + total**: Correct line items, running total using formatCurrency (₱ symbol).
- **Kitchen-note submission**: Single textarea note correctly submitted to all line items' notes fields; absent/blank note correctly omitted.
- **Validation error path**: Over-length note (>500 chars) rejected, error surface shown.
- **Responsive-collapse tests (3 tests)**: Desktop viewport shows full summary panel; narrow viewport (<992px) shows compact bottom bar; tapping bottom bar expands back to full panel.

## Fixtures

Fixtures updated to include `notes: null` on OrderLineItem objects to satisfy the now-required type field (C-39).

## Test pattern

Uses `stubNarrowViewport()` test helper (existing in OwnerPage.test.tsx) to deterministically mock matchMedia in jsdom/vitest, enabling reliable responsive-layout testing without page resizes.
