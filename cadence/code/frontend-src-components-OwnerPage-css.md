---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/OwnerPage.css"]
created: 2026-07-15
updated: 2026-07-16
related: ["[[frontend-src-components-OwnerPage-tsx]]", "[[US-31]]", "[[US-36]]"]
sources: []
---

# frontend/src/components/OwnerPage.css

Styling for the Owner Console shell layout.

## Changes (C-31)

Added header gap (`gap` CSS property in header styles) to accommodate the new explicit accessible collapse trigger button. This ensures proper spacing between the trigger button and adjacent header controls (theme toggle, user menu).

## Changes (C-36)

Removed a hardcoded `background: #fff` from `.owner-page__header` that was discovered during C-36's contrast pass. This white background sat behind antd's dark-theme `Typography.Title`/`Button` text once the theme flipped, causing light-on-light contrast issues. `Layout.Header` has its own theme-aware default background, so removing the override fixes it for free.

Raw hex values are used in this file as per the codebase's architectural pattern (ConfigProvider does not enable antd's `cssVar` mode).

## Used by
- [[frontend-src-components-OwnerPage-tsx|OwnerPage.tsx]] -- imported for shell layout styling
