---
type: file
tags: [code/frontend, code/testing]
aliases: ["frontend/src/components/tableZoneGrouping.test.ts"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-components-tableZoneGrouping-ts]]", "[[C-37]]"]
sources: []
---

# frontend/src/components/tableZoneGrouping.test.ts

Test suite for the tableZoneGrouping pure logic module (C-37). Extracted tests alongside the exported functions following the codebase pattern of tested pure modules (like `salesTrendChartMath.test.ts`).

## Test Coverage

- **Grouping by zone**: tables grouped by their `zone` field
- **Null/blank zone handling**: normalizes to `UNASSIGNED_ZONE` constant
- **Zone order**: zones appear in first-appearance order, except `UNASSIGNED_ZONE` always last
- **Within-zone order**: tables maintain original id/creation order within a zone
- **Empty input**: handles empty table arrays correctly

## Imports
- [[frontend-src-components-tableZoneGrouping-ts|tableZoneGrouping.ts]] functions under test

## Used by
- Component integration tests in [[frontend-src-components-TableLayoutEditor-test-tsx|TableLayoutEditor.test.tsx]]
