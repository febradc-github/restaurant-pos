---
type: file
tags: [code/frontend]
aliases: ["src/App.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-tablelayouteditor-tsx]]", "[[src-components-menumanager-tsx]]", "[[US-3]]", "[[US-4]]"]
sources: []
---

# src/App.tsx

React application entry point. Renders both `<TableLayoutEditor>` and `<MenuManager>`, both using hardcoded-null OWNER_AUTH_TOKEN (TODO comment). No login screen exists yet (future ticket). Currently both components read-only when authToken is null. **Flag:** whoever implements owner login UI must replace OWNER_AUTH_TOKEN constant with real auth state via props/context.

## Exports
- `App` component (React.FC)

## Imports
- `src/components/TableLayoutEditor`
- `src/components/MenuManager`
- React, useState hooks