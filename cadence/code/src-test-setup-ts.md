---
type: file
tags: [code/frontend]
aliases: ["src/test/setup.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["vite-config-ts", "[[US-3]]"]
sources: []
---

# src/test/setup.ts

Vitest + React Testing Library setup: imports @testing-library/jest-dom matchers and configures cleanup. First test infrastructure in the frontend project—establishes the pattern for all future frontend tests (C-6 order taking, C-7 checkout, etc.).

## Exports
- Setup side effects: jest-dom matchers, RTL cleanup