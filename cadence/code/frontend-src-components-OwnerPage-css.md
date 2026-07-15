---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/OwnerPage.css"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[frontend-src-components-OwnerPage-tsx]]", "[[US-31]]"]
sources: []
---

# frontend/src/components/OwnerPage.css

Styling for the Owner Console shell layout.

## Changes (C-31)

Added header gap (`gap` CSS property in header styles) to accommodate the new explicit accessible collapse trigger button. This ensures proper spacing between the trigger button and adjacent header controls (theme toggle, user menu).

Raw hex values are used in this file as per the codebase's architectural pattern (ConfigProvider does not enable antd's `cssVar` mode).

## Used by
- [[frontend-src-components-OwnerPage-tsx|OwnerPage.tsx]] -- imported for shell layout styling
