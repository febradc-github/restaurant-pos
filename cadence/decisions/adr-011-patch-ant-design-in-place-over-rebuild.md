---
type: decision
tags: [frontend, pos]
aliases: []
created: 2026-07-15
updated: 2026-07-16
related: ["[[EP-28]]", "[[US-29]]", "[[US-36]]", "[[DS-28]]", "[[AR-frontend-design-system]]", "[[adr-012-redesign-exception-to-adr-011-patch-default]]", "[[frontend-src-index-css]]"]
sources: []
---

# ADR-011: Patch Ant Design In-Place Over Full Rebuild

## Context

C-28 (\"Frontend GUI Quality & Consistency Pass\") was tasked with fixing a concrete app-shell layout regression (leftover Vite-starter CSS forcing pages to shrink-to-fit instead of stretch) and running a systematic design audit across every screen for accessibility, spacing/typography consistency, and Ant Design polish.

Before implementation, a trade-off arose: should the audit findings be fixed by patching the existing Ant Design implementation in place, or should pages be rebuilt from scratch against ui-ux-pro-max guidance?

## Decision

**Patch in place.** Audit the existing Ant Design implementation (established in C-14 and extended through C-20, C-23) and fix concrete findings on a per-screen basis rather than rebuilding pages from scratch.

## Rationale

C-14 established a working, tested Ant Design foundation across every screen (Login, Owner Console, Cashier, Take-Orders, Kitchen) with a unified `ConfigProvider` theme and routing architecture (see [[AR-frontend-design-system]]). That foundation is production-proven: every screen has landed, been tested, and is in daily use.

A full rebuild would:
- Risk regressing tested functionality across 7+ screens for no benefit over targeted audit-and-fix.
- Treat working code as broken and require re-testing every interaction and every accessibility concern.
- Over-engineer the solution relative to the actual problem: a concrete shell bug (the `#center` `place-items: center` regression) plus unknown polish gaps, not a fundamental architecture failure.

A targeted audit-and-fix approach:
- Preserves proven behavior while fixing concrete regressions and polish issues.
- Allows fixes to be independently reviewable and scoped (broken into per-page stories).
- Pairs well with the shell-layer cleanup (remove dead Vite-starter CSS), which is a surgical fix, not a rebuild.

## Alternatives Rejected

**Full rebuild from scratch against ui-ux-pro-max guidelines.** Rejected because it risks regressing tested functionality and is over-engineering relative to the problem at hand. The right time for a full rebuild would be a future major visual redesign, not a quality/consistency pass on a working system.

## Superseded By

[[adr-012-redesign-exception-to-adr-011-patch-default]] -- for C-35's three redesigned pages (Owner Console Table Layout, Cashier, Server/Take-Orders) specifically. C-28 through C-34's already-shipped audit work (Login, Kitchen, Employees/Analytics layout, app-shell cleanup, contrast/truncation pass) remains unchanged under this decision.

## Related Decisions

- [[adr-009-frontend-redesign-before-digital-transformation]] -- established the C-14 redesign as foundational, not something to revisit quickly. This decision honors that by not attempting a second redesign in the same year.

## Implementation Notes

C-28 breaks down into:
1. App-shell cleanup: remove `#center`'s `place-items: center` and all dead Vite-starter CSS/markup from `App.tsx` and `App.css`. Implemented in [[US-29]].
2. Systematic audit: invoke `ui-ux-pro-max` to audit every screen for accessibility, spacing/typography, and Ant Design token consistency.
3. Per-page fix stories: broken down via `/cadence:breakdown` so each fix is independently scoped and reviewable.

## C-36 Note: Dark Theme Applied Globally

C-36's app-wide dark theme ([[frontend-src-theme-ts]], [[frontend-src-index-css]]) is applied via ConfigProvider at the root level, not per-page. This follows the spirit of ADR-011 (single source of truth for theme config) while delivering on C-35's requirement for a unified dark palette across all screens.
