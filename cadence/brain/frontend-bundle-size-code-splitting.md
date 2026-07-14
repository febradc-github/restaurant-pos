---
type: domain
tags: [code/frontend, frontend/performance]
aliases: ["antd bundle size performance"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-15]]", "[[US-16]]", "[[US-17]]", "[[US-18]]", "[[US-19]]"]
sources: []
---

# Ant Design bundling: main JS chunk size flag

With antd bundled as a single whole import, the frontend's production main JS chunk is 795kB (254kB gzipped). Not fixed in C-15—the full antd bundle is acceptable for now. If tablet/kitchen-display load time becomes a concern once C-16-19 add more antd-heavy pages, route-based code-splitting is the natural fix:

- Wrap each role's page component in `React.lazy()` (e.g., `const OwnerPage = lazy(() => import('./pages/OwnerPage'))`)
- Use `<Suspense fallback={<Spin/>}>` at the route level
- Vite will automatically code-split each route into its own chunk

This will defer the full antd import until that route is first navigated to, reducing the initial load.
