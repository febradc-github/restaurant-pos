---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/OrderTaking.css"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-components-ordertaking-tsx]]", "[[US-39]]"]
sources: []
---

# frontend/src/components/OrderTaking.css

Complete rewrite for C-39 grid/panel/bottom-bar layout.

## Key changes

- **Grid layout for menu**: Replaced old wide-row item spread with compact stacked cards (name/price/stepper vertically aligned).
- **Category section headers**: Section-level headings above grouped menu items.
- **Category filter chips**: Styled chip container with quick-select radio buttons.
- **Search box**: Full-width search input above the menu grid.
- **Table-selection radio group**: Horizontal chip layout with solid buttonStyle for brand-color fill on selection.
- **Summary panel**: Persistent right-hand column on desktop; shows line items, running total, kitchen-notes textarea, send button.
- **Bottom-bar for narrow viewports**: Compact single-row bar (item count · total · Send button) below tablet width; flex-centered, easily tappable. Expands on tap to overlay/modal-like full summary panel.
- **Price prefix removal**: Old `.order-taking__item-price::before{content:'$'}` removed; formatCurrency now handles currency display in JSX (₱ for peso per C-38 convention).
- **Accent border theming**: Selected items' borders use antd runtime theme's colorPrimary (set via theme.useToken() in component).

## Responsive breakpoint

Uses `@media (max-width: 991.98px)` to match the `useIsNarrowViewport()` hook's matchMedia query.
