---
type: file
tags: [code/frontend]
aliases: ["frontend/src/App.css"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[US-29]]", "[[AR-frontend-design-system]]", "[[frontend-src-app-tsx]]", "[[frontend-src-index-css]]"]
sources: []
---

# frontend/src/App.css

Application shell stylesheet. Removed all dead `create-vite` starter-template CSS (`.counter`, `.hero`, nested `.base`/`.framework`/`.vite` rules, `#center` including `place-items: center`, `#next-steps`, `#docs`, `#spacer`, `.ticks`) in C-29. Retained `.app__session` (SessionBar styling) and added minimal `.app__main { flex: 1; }` to allow routed pages to stretch and fill available width.

## Exports
- `.app__session` -- session bar container styling
- `.app__main` -- main content flex container (flex: 1)
