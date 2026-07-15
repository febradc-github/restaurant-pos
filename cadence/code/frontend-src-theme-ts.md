---
type: file
tags: [code/frontend]
aliases: ["frontend/src/theme.ts"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[US-36]]", "[[AR-frontend-design-system]]", "[[frontend-src-theme-test-ts]]"]
sources: []
---

# frontend/src/theme.ts

Shared Ant Design theme configuration for the whole POS SPA. Established in C-15 and applied at app root via ConfigProvider; every role's page components (Owner/Cashier/Take-Orders/Kitchen) inherit these tokens rather than picking their own colors.

## Changes (C-36)

App-wide dark theme foundation: added `algorithm: antdTheme.darkAlgorithm` to enable dark mode. The algorithm derives the full neutral scale (colorBgElevated, colorText, colorBorder, ...) from the two anchors pinned here. `colorPrimary` nudged from `#C2410C` (light-theme terracotta) to `#E55E10` (brighter shade of same hue); this was necessary because antd's dark algorithm derives its "primary as foreground" variant by darkening the seed, and the original seed only hit ~2.9:1 contrast against colorBgContainer (below WCAG's 3:1 UI-component floor). The new seed derives ~4:1+ foreground contrast against both colorBgContainer and colorBgLayout, and ~4.5:1 for white text on primary fills, while staying in the burnt-orange family. `colorBgLayout` set to pure black (`#000000`), `colorBgContainer` to near-black (`#141414`).

## Exports
- `theme: ThemeConfig` -- ConfigProvider-ready Ant Design theme object with dark algorithm and warm terracotta primary color

## Imports
- `antd` (theme, ThemeConfig) -- Ant Design theme utilities

## Used by
- `frontend/src/index.tsx` -- applies theme via ConfigProvider at app root
