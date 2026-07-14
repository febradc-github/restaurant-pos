---
type: domain
tags: [code/frontend]
aliases: ["antd matchMedia jsdom stub"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-test-setup-ts]]", "[[US-15]]"]
sources: []
---

# antd + jsdom: matchMedia stub required

Ant Design components call `window.matchMedia` on mount for internal responsive-breakpoint observation. jsdom does not implement matchMedia by default, causing a hard test failure: "matchMedia is not a function" whenever any antd component is rendered in a test.

**Fix:** Stub `window.matchMedia` globally in test setup (src/test/setup.ts). This is now the shared setup for all frontend tests. Any new test file that doesn't use the shared setup but renders antd components will hit this failure.

Applies to any antd + Vitest/jsdom project.
