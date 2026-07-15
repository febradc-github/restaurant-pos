---
type: file
tags: [code/frontend]
aliases: ["frontend/src/index.css"]
created: 2026-07-15
updated: 2026-07-16
related: ["[[US-29]]", "[[US-36]]", "[[AR-frontend-design-system]]", "[[frontend-src-app-css]]", "[[vitest-raw-css-imports-empty-string-gotcha]]"]
sources: []
---

# frontend/src/index.css

Global app-level stylesheet for the root `#root` container and base layout. Removed landing-page constraints in C-29 (`width: 1126px`, `max-width: 100%`, `margin: 0 auto`, `text-align: center`, `border-inline`) that were leftover from Vite starter template. Retained app-shell properties: `min-height: 100svh`, `display: flex`, `flex-direction: column`, `box-sizing: border-box`.

## Changes (C-36)

Removed the `@media (prefers-color-scheme: dark)` block entirely. This was leftover pre-C-29 Vite-scaffold CSS that flipped `:root` CSS custom properties based on OS preference, independent of the app's actual Ant Design theme. Now that the app has a real, always-dark ConfigProvider (see [[frontend-src-theme-ts]]), that OS-conditional block was redundant and conflicting. The values that were inside it became the new base `:root` values (app is dark-only now, not OS-conditional). Changed `color-scheme: light dark` to `color-scheme: dark` to signal to the browser that the app expects a dark viewport.

## Exports
- `#root` -- root container flex layout

## Known Issues

**vitest `?raw` CSS imports resolve to empty string (pre-existing, unrelated to C-36).** With `test.css: false` set in vitest.config.ts, CSS imports with the `?raw` suffix (e.g., `import indexCss from './index.css?raw'`) resolve to an empty string in the test environment. This is likely a Vite CSS pipeline configuration issue. App.test.tsx's C-36 index.css regression test works around this by reading the file directly via `node:fs` instead of using `?raw`. See [[vitest-raw-css-imports-empty-string-gotcha]] for details.
