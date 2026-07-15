---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/OwnerPage.test.tsx"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[frontend-src-components-OwnerPage-tsx]]", "[[TK-34]]", "[[vitest-jsdom-layout-regression-test-pattern]]"]
sources: []
---

# frontend/src/components/OwnerPage.test.tsx

Test suite for `OwnerPage.tsx` covering the layout and sidebar behavior. Includes C-31 accessibility tests for the sider collapse button (keyboard support, aria-label).

## Changes (C-34)

Added three regression tests for the sidebar width fix:
1. **"sidebar full label text present (C-34 regression)"** -- asserts that nav labels like "Menu Management" are not truncated and render in full. Validates fix for the font-size mismatch bug.
2. **"expanded width > 200px (C-34 regression)"** -- asserts that the Sider's expanded `style.width` inline property is greater than 200px (verifies explicit width={230} is applied).
3. **"collapsed width still 80px (C-34 regression)"** -- asserts that when collapsed, the Sider's width is still antd's default 80px, confirming `collapsedWidth` was not changed.

These tests use the **vitest+jsdom layout-regression pattern**: they assert on the component's *inline* `style.width`, not on rendered text content or computed styles (see [[vitest-jsdom-layout-regression-test-pattern]] for details). Real stylesheet rules (antd's `.ant-menu-title-content` text-overflow:ellipsis) never apply in jsdom tests (vitest.config.ts runs with `css: false`), making text-content assertions meaningless for truncation bugs.

## Exports
- Test cases only (no named exports)

## Imports
- `react`, `@testing-library/react` -- component testing framework
- `vitest` -- test runner
- `[[frontend-src-components-OwnerPage-tsx|frontend/src/components/OwnerPage.tsx]]` -- component under test
