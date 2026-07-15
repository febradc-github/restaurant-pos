---
type: file
tags: [code/frontend, code/testing]
aliases: ["frontend/src/App.test.tsx"]
created: 2026-07-15
updated: 2026-07-16
related: ["[[US-29]]", "[[US-36]]", "[[TK-34]]", "[[frontend-src-app-tsx]]", "[[frontend-src-app-css]]", "[[frontend-src-index-css]]", "[[vitest-jsdom-layout-regression-test-pattern]]", "[[vitest-raw-css-imports-empty-string-gotcha]]"]
sources: []
---

# frontend/src/App.test.tsx

Test suite for `App.tsx` focusing on app-shell layout regression tests (C-29). Includes `describe('app shell layout (C-29 regression)')` block asserting: no `#center` element in rendered output; `App.css` and `index.css` no longer contain dead selectors, `place-items: center`, or Vite-starter `width: 1126px` constraint. Uses Vite's `?raw` suffix to assert against actual CSS file content without requiring a full browser/layout engine, establishing a pattern for future layout-regression tests.

## Changes (C-34)

Added regression test "session bar contrast (C-34 regression)" asserting that SessionBar has an explicit background color set via inline style, preventing the index.css dark-mode `:root` background from bleeding through.

## Changes (C-36)

Extended with a C-36 regression test asserting index.css no longer contains the OS-driven `@media (prefers-color-scheme: dark)` media query. The test needed a workaround: `?raw` CSS imports currently resolve to an empty string under this project's vitest config (see [[vitest-raw-css-imports-empty-string-gotcha]]), so the test reads the file via `node:fs` directly instead. This required `/// <reference types="node" />` at the file top to bring in ambient Node types for TypeScript.

## Exports
- Test cases only (no named exports)

## Imports
- `node:fs`, `node:path` -- filesystem access for CSS file content assertions (C-36 workaround)
- `react`, `@testing-library/react` -- component testing framework
- `vitest` -- test runner
- `react-router-dom` (MemoryRouter) -- in-memory router for testing
- `[[frontend-src-app-tsx|frontend/src/App.tsx]]` -- component under test
- `App.css?raw`, `index.css?raw` -- CSS content assertions (note: these resolve to empty string; see gotcha note above)
