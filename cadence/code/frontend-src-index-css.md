---
type: file
tags: [code/frontend]
aliases: ["frontend/src/index.css"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[US-29]]", "[[AR-frontend-design-system]]", "[[frontend-src-app-css]]"]
sources: []
---

# frontend/src/index.css

Global app-level stylesheet for the root `#root` container and base layout. Removed landing-page constraints in C-29 (`width: 1126px`, `max-width: 100%`, `margin: 0 auto`, `text-align: center`, `border-inline`) that were leftover from Vite starter template. Retained app-shell properties: `min-height: 100svh`, `display: flex`, `flex-direction: column`, `box-sizing: border-box`.

## Exports
- `#root` -- root container flex layout
