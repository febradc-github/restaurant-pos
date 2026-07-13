---
type: file
tags: [code/frontend]
aliases: ["src/App.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["src-components-tablelayouteditor-tsx", "[[US-3]]"]
sources: []
---

# src/App.tsx

React application entry point. Rewritten: replaced default Vite counter demo with `<TableLayoutEditor authToken={OWNER_AUTH_TOKEN} />`. authToken is hardcoded to `null` with a TODO comment—no login screen exists yet (future ticket, likely alongside/after C-2 backend auth). Currently always renders read-only. **Flag:** whoever implements owner login UI must replace OWNER_AUTH_TOKEN constant with real auth state via props/context.

## Exports
- `App` component (React.FC)

## Imports
- `src/components/TableLayoutEditor` -- floor plan editor
- React, useState hooks