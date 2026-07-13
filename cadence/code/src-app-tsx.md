---
type: file
tags: [code/frontend]
aliases: ["src/App.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-tablelayouteditor-tsx]]", "[[src-components-menumanager-tsx]]", "[[src-components-ordertaking-tsx]]", "[[src-components-kitchendisplay-tsx]]", "[[US-3]]", "[[US-4]]", "[[US-6]]"]
sources: []
---

# src/App.tsx

React application entry point. Renders TableLayoutEditor, MenuManager (owner-facing, gated by OWNER_AUTH_TOKEN), OrderTaking, and KitchenDisplay (no auth, server/kitchen pattern from C-2). No login screen exists (future ticket).

## Exports
- `App` component (React.FC)

## Imports
- `src/components/TableLayoutEditor`
- `src/components/MenuManager`
- `src/components/OrderTaking`
- `src/components/KitchenDisplay`
- React, useState hooks

## C-6 change

OrderTaking and KitchenDisplay added side-by-side with existing owner-facing components. Neither is given an auth token (matches C-2's server/kitchen device assumption).
