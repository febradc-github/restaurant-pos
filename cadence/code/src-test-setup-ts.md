---
type: file
tags: [code/frontend]
aliases: ["src/test/setup.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[vite-config-ts]]", "[[antd-jsdom-test-gotcha]]", "[[antd-form-field-dom-id-collision]]", "[[US-16]]", "[[US-15]]", "[[US-3]]"]
sources: []
---

# src/test/setup.ts

Vitest + React Testing Library setup: imports @testing-library/jest-dom matchers, configures cleanup. Stubs two jsdom gaps: `window.matchMedia` (antd Layout/breakpoint components call this) and `ResizeObserver` (antd Select/overlay components call this). Both stubs are required globally. This is the single source of truth for all frontend test files.

## Exports
- Setup side effects: jest-dom matchers, RTL cleanup, matchMedia and ResizeObserver stubs
