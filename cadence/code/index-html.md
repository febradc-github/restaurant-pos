---
type: file
tags: [code/frontend]
aliases: ["index.html"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-theme-ts]]", "[[US-15]]"]
sources: []
---

# index.html

HTML entry point. Added `<link rel="preconnect">` to Google Fonts CDN and `<link>` for Plus Jakarta Sans font (weights 400-800, used in antd ConfigProvider theme.ts). This project had no prior font-loading convention; fonts are now loaded via index.html `<link>` rather than CSS `@import` or JS.

## Exports
- HTML shell for app root
