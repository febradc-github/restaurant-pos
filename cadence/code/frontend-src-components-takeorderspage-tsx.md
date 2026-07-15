---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/TakeOrdersPage.tsx"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-app-tsx]]", "[[frontend-src-components-ordertaking-tsx]]", "[[US-39]]"]
sources: []
---

# frontend/src/components/TakeOrdersPage.tsx

Simple wrapper page component for the Server/take-orders view. Receives `serverName` prop from [[frontend-src-app-tsx|App.tsx]] (the authenticated session's user name, forwarded as a display-only prop despite the order-taking API being unauthenticated per adr-008). Forwards the serverName to [[frontend-src-components-ordertaking-tsx|OrderTaking]] component.

## Exports
- `TakeOrdersPage(props: { serverName: string })` -- page wrapper

## Imports
- `react` -- component framework
- [[frontend-src-components-ordertaking-tsx|frontend/src/components/OrderTaking]] -- order-taking form component
