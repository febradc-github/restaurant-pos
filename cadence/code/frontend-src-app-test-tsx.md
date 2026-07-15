---
type: file
tags: [code/frontend]
aliases: ["frontend/src/App.test.tsx"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[US-29]]", "[[frontend-src-app-tsx]]", "[[frontend-src-app-css]]", "[[frontend-src-index-css]]"]
sources: []
---

# frontend/src/App.test.tsx

Test suite for `App.tsx` focusing on app-shell layout regression tests (C-29). Includes `describe('app shell layout (C-29 regression)')` block asserting: no `#center` element in rendered output; `App.css` and `index.css` no longer contain dead selectors, `place-items: center`, or Vite-starter `width: 1126px` constraint. Uses Vite's `?raw` suffix to assert against actual CSS file content without requiring a full browser/layout engine, establishing a pattern for future layout-regression tests.

## Exports
- Test cases only (no named exports)

## Imports
- `react`, `@testing-library/react` -- component testing framework
- `vitest` -- test runner
- `[[frontend-src-app-tsx|frontend/src/App.tsx]]` -- component under test
- `App.css?raw`, `index.css?raw` -- CSS content assertions
