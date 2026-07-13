---
type: file
tags: [code/frontend]
aliases: ["vite.config.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["src-test-setup-ts", "package-json", "[[US-3]]"]
sources: []
---

# vite.config.ts

Vite configuration. Modified to add test runner config: `test.environment: 'jsdom'` and setup file pointing to src/test/setup.ts. Establishes frontend testing baseline for future tickets.

## Exports
- Vite config with test.environment and setupFiles