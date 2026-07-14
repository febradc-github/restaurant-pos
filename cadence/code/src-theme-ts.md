---
type: file
tags: [code/frontend]
aliases: ["src/theme.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-app-tsx]]", "[[index-html]]", "[[US-15]]", "[[DS-15]]", "[[EP-14]]"]
sources: []
---

# src/theme.ts

Shared Ant Design ConfigProvider theme token object—single source of truth for brand palette and typographic defaults. Exports:
- `colorPrimary: '#C2410C'` (terracotta, deliberately distinct from `colorError: '#DC2626'` true red to avoid primary/destructive color clash in kitchen contexts)
- `colorSuccess: '#16A34A'`
- `colorWarning: '#CA8A04'`
- `colorInfo: '#0369A1'`
- `colorBgLayout: '#FAFAFA'` (neutral, not a tinted wash—chosen for kitchen-display legibility over colored backgrounds)
- `fontFamily: 'Plus Jakarta Sans'` (400-800 weights, preconnected in index.html)
- `fontSize: 16`
- `borderRadius: 8`

Every subsequent page story (C-16-19) should import antd components against this theme via ConfigProvider at App.tsx level. No per-page ConfigProvider needed.

## Exports
- `themeToken: AntdThemeConfig` -- brand palette and typography defaults
