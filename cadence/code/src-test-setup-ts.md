---
type: file
tags: [code/frontend]
aliases: ["src/test/setup.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[vite-config-ts]]", "[[antd-jsdom-test-gotcha]]", "[[US-15]]", "[[US-3]]"]
sources: []
---

# src/test/setup.ts

Vitest + React Testing Library setup: imports @testing-library/jest-dom matchers, configures cleanup, and stubs `window.matchMedia` (which jsdom does not implement by default). The matchMedia stub is required globally—antd components call `window.matchMedia` on mount for internal breakpoint observation; without this stub, any test rendering antd components fails with "matchMedia is not a function". This is now the single source of truth for all frontend test files.

## Exports
- Setup side effects: jest-dom matchers, RTL cleanup, matchMedia stub
