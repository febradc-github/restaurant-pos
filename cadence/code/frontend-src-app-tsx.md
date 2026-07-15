---
type: file
tags: [code/frontend]
aliases: ["frontend/src/App.tsx"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[US-29]]", "[[TK-34]]", "[[AR-frontend-design-system]]", "[[frontend-src-app-css]]", "[[frontend-src-app-test-tsx]]", "[[owner-console-ui-audit-learnings]]"]
sources: []
---

# frontend/src/App.tsx

Main application component wrapping routed pages inside a session bar and flex-based main content area. Removed Vite-starter-template `#center` markup and replaced with semantic `<main className="app__main">` as part of C-29 shell cleanup.

## Changes (C-34)

SessionBar component now calls antd's `theme.useToken()` and applies an explicit inline style `background: token.colorBgContainer` to `.app__session`. This resolves a contrast bug where the session bar's "Logged in as..." text was dark-on-near-black and unreadable under OS dark mode. Root cause: index.css (pre-C-29 landing-page leftover) paints `:root`/html near-black under `@media (prefers-color-scheme: dark)`, and `.app__session` had no background of its own, so that near-black bled through, while antd's Typography.Text still rendered light-theme dark text. The fix uses runtime theme awareness rather than relying on CSS-based dark-mode detection.

## Exports
- `App()` -- root component; renders SessionBar and outlet for react-router pages

## Imports
- `react` -- component framework
- `react-router-dom` -- Outlet for routed page content
- `antd` (theme.useToken) -- runtime theme token access
- `frontend/src/components/SessionBar.tsx` -- session authentication/role bar
- `./App.css` -- app-shell styling
