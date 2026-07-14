---
type: decision
tags: [frontend]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-14]]", "[[AR-frontend-design-system]]"]
sources: []
---

# ADR-009: Frontend Redesign Before Digital Transformation Epics

Sequenced C-14 (Role-Based Page Architecture & Ant Design Redesign) ahead of two not-yet-refined epics scoped in the same brainstorm session: Owner Employee Management and Owner Analytics Dashboard.

## Context

Brainstorm session identified multiple high-value Owner features for future increments:
- Employee staff management (hiring, payroll, performance)
- Analytics and reporting dashboards (sales, inventory trends, labor costs)

Both are "digital transformation" features in scope but lower-priority than core operational usability (ordering, payment, attendance). Session deferred them to post-v1.

Current codebase has no frontend design system or routing framework -- App.tsx conditionally renders screens inline based on session role, each with hand-written CSS. Building Employee Management or Analytics inside this structure would require:
1. Implement the feature in the old architecture (inline conditionals, custom CSS)
2. Immediately redesign it after C-14 lands (adopt routing, Ant Design, new palette)
3. Double the implementation + design effort

## Decision

**Redesign the existing UI first (C-14), then add new digital transformation features on top of the new architecture.**

Route new features directly into the completed design system, page architecture, and routing foundation. Avoid the build-then-rebuild pattern.

## Alternatives Considered

1. **Build Employee Management and Analytics in the old architecture, redesign after C-14** – rejected: multiplies front-end work and creates visual inconsistency (two design passes for the same feature).
2. **Defer C-14 and push Employee Management earlier** – rejected: redesign is a foundational prerequisite for consistency; digital features are lower priority.
3. **Run C-14 and digital features in parallel** – rejected: Employee Management / Analytics would block on design work while C-14 is in progress, and the old architecture would still be the target if C-14 slips.

## Consequences

- **Pro:** Digital transformation features (Employee Management, Analytics) land in a cohesive design system, fully routed, with a single implementation pass.
- **Pro:** C-14 establishes the frontend foundation (routing, design library, theme) for all future features.
- **Con:** Owner-facing digital features delayed past the C-14 sprint. Prioritized by operational necessity (core order-taking, payment, attendance) over analytics.
