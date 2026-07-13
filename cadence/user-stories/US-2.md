---
type: story
tags: []
aliases: ["C-2", "Authentication & Role-Based Access"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[DS-2]]", "[[EP-1]]", "[[SP-2]]"]
---

# C-2: Authentication & Role-Based Access

Implements login for Owner and Cashier and enforces role-based access across all four roles (Owner, Cashier, Server, Kitchen) at the API level, so device-level Server/Kitchen access can't reach Owner- or Cashier-only actions.

- Design: [[DS-2]]
- Spec: [[SP-2]]
- Parent: [[EP-1]]
