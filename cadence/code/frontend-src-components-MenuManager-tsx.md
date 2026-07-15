---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/MenuManager.tsx"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[US-31]]"]
sources: []
---

# frontend/src/components/MenuManager.tsx

Menu management section of the Owner Console. Provides interface for editing restaurant menu items and categories.

## Changes (C-31)

Replaced raw `<h2>` page heading with `Typography.Title level={2}` to align with antd theming and avoid CSS inheritance from index.css boilerplate. This ensures consistent typography and proper theme token application across admin pages.

## Exports
- `MenuManager` (component) -- menu item and category editor

## Imports
- `Typography` from `antd` -- for properly themed heading
- (other antd components for form/table controls)

## Used by
- [[frontend-src-components-OwnerPage-tsx|OwnerPage.tsx]] -- rendered as a section within Owner Console
