---
type: file
tags: [code/frontend]
aliases: ["frontend/src/App.tsx"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[US-29]]", "[[AR-frontend-design-system]]", "[[frontend-src-app-css]]", "[[frontend-src-app-test-tsx]]"]
sources: []
---

# frontend/src/App.tsx

Main application component wrapping routed pages inside a session bar and flex-based main content area. Removed Vite-starter-template `#center` markup and replaced with semantic `<main className="app__main">` as part of C-29 shell cleanup.

## Exports
- `App()` -- root component; renders SessionBar and outlet for react-router pages

## Imports
- `react` -- component framework
- `react-router-dom` -- Outlet for routed page content
- `frontend/src/components/SessionBar.tsx` -- session authentication/role bar
- `./App.css` -- app-shell styling
