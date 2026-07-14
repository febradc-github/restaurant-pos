---
type: domain
tags: [code/frontend]
aliases: ["antd v6.5.1 List/Item deprecated"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-ordertaking-tsx]]", "[[US-18]]"]
sources: []
---

# antd v6.5.1: List and List.Item components deprecated

Ant Design v6.5.1 (pinned in this project) has deprecated the `List` and `List.Item` components and emits runtime console warnings when they are used.

**Workaround:** Use a plain mapped list with `Card` components or a div-based grid instead. This project's OrderTaking component (rebuilt in C-18) deliberately avoided List/List.Item and used a plain div-based grid for menu items to prevent deprecation warnings.

**Applies to:** All new components built after C-18 should follow this pattern instead of reaching for `List`.
