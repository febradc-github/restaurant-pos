---
type: domain
tags: [code/frontend, code/testing]
aliases: []
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-app-test-tsx]]", "[[frontend-src-index-css]]", "[[vitest-jsdom-layout-regression-test-pattern]]"]
sources: []
---

# vitest ?raw CSS Imports Resolve to Empty String

With `test.css: false` set in vitest.config.ts, CSS imports with the `?raw` suffix (e.g., `import appCss from './App.css?raw'`) resolve to an empty string in the test environment, not the actual file content.

**Discovery:** C-29 introduced `?raw` CSS imports to assert on raw source content in App.test.tsx (see [[vitest-jsdom-layout-regression-test-pattern]]). Those assertions have been silently vacuous for an unknown period -- every test against `appCssSource`/`indexCssSource` was checking against an empty string and always trivially passing.

**Root cause (likely):** With `test.css: false` set, Vite's CSS pipeline is disabled for the test environment. The `?raw` suffix should bypass that pipeline and hand the raw file content to the test, but the current configuration appears to disable the pipeline for `?raw` queries too.

**Workaround:** Read the file via `node:fs` directly instead. See App.test.tsx's C-36 index.css regression test for an example. This adds `/// <reference types="node" />` at the file top to bring in ambient Node types.

**Out of scope:** C-36 did not fix the vitest config or re-verify the existing C-29 assertions. This is a pre-existing test-infra bug. A follow-up quick-lane bug ticket should fix vitest.config.ts's `test.css` setting and re-verify the old C-29 assertions actually still hold under real conditions.

**Impact:** Any test asserting on `?raw` CSS content is potentially unreliable. The pattern established by C-29 is now known to be broken; new tests asserting on file content should use the node:fs workaround instead.
