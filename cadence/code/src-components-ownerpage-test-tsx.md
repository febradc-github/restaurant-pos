---
type: file
tags: [code/frontend]
aliases: ["src/components/OwnerPage.test.tsx"]
created: 2026-07-14
updated: 2026-07-15
related: ["[[src-components-ownerpage-tsx]]", "[[antd-jsdom-test-gotcha]]", "[[US-22]]", "[[US-26]]", "[[EP-20]]", "[[EP-23]]"]
sources: []
---

# src/components/OwnerPage.test.tsx

10 tests for OwnerPage shell and nav: rendering page structure, menu nav item activation, nested route rendering (tables/menu/employees/analytics), sider collapse/expand, active menu item highlighting. Extended in C-26 to include 3 new tests for Analytics nav entry and `/owner/analytics` route rendering. The test's stubFetch() helper was extended with analytics/restock/time-entries routes to support those new tests.
