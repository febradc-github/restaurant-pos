---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/OrderTaking.tsx"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-components-ordertaking-test-tsx]]", "[[frontend-src-components-ordertaking-css]]", "[[frontend-src-components-takeorderspage-tsx]]", "[[frontend-src-api-orders-ts]]", "[[frontend-src-types-order-ts]]", "[[frontend-src-utils-currency-ts]]", "[[US-39]]"]
sources: []
---

# frontend/src/components/OrderTaking.tsx

Full rebuild for C-39: the Server/kitchen-note order-taking flow. Fetches categories alongside menu items, renders a category-sectioned menu grid with category filter chips and search, table-selection radio chips with server-name tag display, and a persistent (or responsive-collapsed) order-summary panel with kitchen-notes textarea.

## Key features

- **Category-driven menu layout**: Fetches Category list (alongside tables/menu) on mount in parallel with existing calls. Menu items grouped and rendered under category section headers.
- **Category filter chips**: Quick-select chips below search box; tapping a chip filters menu grid to that category only.
- **Search filtering**: Real-time textbox filter across menu item names.
- **Table selection**: Replaced searchable Select with Radio.Group/Radio.Button chips (buttonStyle="solid") so the selected table fills with brand accent color. Displays "Served by {serverName}" tag beside the selected chip.
- **Item accent borders**: When an item's quantity > 0, a runtime-color border (via antd's theme.useToken() colorPrimary) accents the item card.
- **Persistent order-summary panel**: Shows selected line items, running total (using [[frontend-src-utils-currency-ts|formatCurrency]] for ₱ display, replacing old hardcoded $ prefix), kitchen-notes textarea, and Send-to-kitchen submit button.
- **Responsive bottom-bar collapse**: New `useIsNarrowViewport()` hook (window.matchMedia('(max-width: 991.98px)')) swaps the summary panel for a compact bottom bar below tablet width (item count · total · Send). Bottom bar is tappable to expand back to full panel. Distinct from C-37's antd-Sider-breakpoint pattern — this uses matchMedia for testability in jsdom/vitest.
- **Kitchen-note modeling**: The single textarea note is submitted to every line item's notes field, satisfying the backend schema (notes on order_items) while keeping the Server UI simple. All items in an order carry the same note text (or all null).
- **No-auth-header API calls**: Maintains the existing adr-008 pattern (Server screen-gated, API open).

## Exports
- `OrderTaking(serverName: string)` -- main component

## Imports
- `react`, `react-router-dom` -- component/routing framework
- `antd` (Form, Input, Button, Radio, Space, theme.useToken, Tag, Table, etc.) -- UI components and runtime theme
- [[frontend-src-api-orders-ts|frontend/src/api/orders]] -- create() for order submission
- [[frontend-src-types-order-ts|frontend/src/types/order]] -- Order, OrderLineItem, NewOrderItem types
- [[frontend-src-utils-currency-ts|frontend/src/utils/currency]] -- formatCurrency for peso display
- Internal `useIsNarrowViewport()` hook -- responsive breakpoint detection via matchMedia

## Used by
- [[frontend-src-components-takeorderspage-tsx|frontend/src/components/TakeOrdersPage.tsx]] -- receives serverName prop and renders this component

## Testing
- [[frontend-src-components-ordertaking-test-tsx|frontend/src/components/OrderTaking.test.tsx]] -- 14 tests covering mount/fetch, category grouping, filtering, table selection, accent borders, summary panel, keyboard-note submission, validation, and responsive collapse
