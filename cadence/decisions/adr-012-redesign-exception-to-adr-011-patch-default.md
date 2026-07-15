---
type: decision
tags: [frontend, pos]
aliases: []
created: 2026-07-15
updated: 2026-07-15
related: ["[[adr-011-patch-ant-design-in-place-over-rebuild]]", "[[EP-35]]", "[[DS-35]]", "[[AR-frontend-design-system]]"]
sources: []
---

# ADR-012: Major Visual Redesign Exception to ADR-011's Patch-In-Place Default

## Context

ADR-011 ("Patch Ant Design In-Place Over Full Rebuild") established a patch-in-place strategy for C-28 through C-34: audit the production-proven Ant Design foundation and fix concrete regressions and polish gaps per-screen, rather than rebuilding pages from scratch. That decision explicitly noted its own exception: "The right time for a full rebuild would be a future major visual redesign, not a quality/consistency pass on a working system."

C-35 ("Dark Theme Redesign & UX Overhaul") is that major visual redesign. Three role screens (Owner Console's Table Layout, Cashier/Checkout, Server/Take-Orders) require core interaction-model changes (canvas → card grid, dropdown → chips, no-cart → persistent order-summary panel) and an app-wide theme shift from light terracotta to dark that cannot be accomplished within a patch-in-place scope.

## Decision

**Supersede ADR-011's patch-in-place default for C-35's three pages specifically** (Owner Console Table Layout, Cashier, Server/Take-Orders) and the app-wide dark theme. **Do not reopen or invalidate the already-shipped C-28 through C-34 fixes** elsewhere (Login, Kitchen, Employees/Analytics layout, the C-29 app-shell cleanup, C-34's contrast/truncation pass, C-32/C-33's Checkout/Kitchen safeguards). Those pages inherit the new dark theme but keep their current layouts and interactions.

## Rationale

ADR-011 correctly identified that incremental audits and surgical fixes are the right approach for established, tested pages without fundamental UX problems. C-28 through C-34 proved this: each audit story found concrete polish gaps (spacing, contrast, accessibility, shell-layer orphaned CSS, safeguard UX) and fixed them without regressing functionality. Those fixes are production-proven and ship as-is.

C-35's three pages have accumulated real usability gaps beyond polish: Cashier has no order identifiers (risk of confirming the wrong payment), no order-level context (shift summary), and unbounded card growth with no visible total/payment controls. Server has no categorization in a menu that will grow, no visible cart while building an order, and no way to attach kitchen notes. Owner Console's canvas-based floor-plan editor doesn't match the user's requested design at all.

These are interaction-model problems, not polish problems. They warrant the exception ADR-011 explicitly named: a targeted redesign for three pages where the user has supplied reference designs specifying new layouts and interaction patterns.

The dark theme is app-wide because the existing `ConfigProvider` already provides a single global theme umbrella (established in C-14). Scoping the theme to Owner Console only would fragment the design system (two themes to maintain) without clear benefit -- none of the reference designs suggested Cashier/Server/Login stay light. The theme change is a clean surgical replacement (one `ConfigProvider` palette swap) with no interaction-model impact on pages that already work.

## Alternatives Rejected

**Defer the redesign until a later major version.** Rejected because the user-supplied reference designs and the accumulated usability gaps (especially the payment-identity risk in Cashier) merit addressing now. C-35 is approved and sized as a single epic; deferring adds no new information.

**Redesign all pages, not just three.** Rejected because it over-engineers the solution. Login, Kitchen, and Employees/Analytics have no stated usability problems and no reference designs. Redesigning them would repeat the risk-for-no-benefit pattern that ADR-011 correctly avoided in C-28. They inherit the dark theme as-is.

## Related Decisions

- [[adr-011-patch-ant-design-in-place-over-rebuild]] -- established the patch-over-rebuild default that this decision explicitly names as the exception. ADR-011 is **superseded by this decision for C-35's three pages only**, with all other in-flight and shipped audit work (C-28 through C-34) left unchanged.
- [[adr-009-frontend-redesign-before-digital-transformation]] -- established C-14's redesign as foundational. This decision honors that by not attempting a second full-app redesign; the exception is narrowly scoped to real UX problems with user-supplied reference designs.

## Implementation Notes

C-35 breaks down into per-page/per-concern stories (set via `/cadence:breakdown`):
1. App-wide dark theme foundation (ConfigProvider palette update, index.css reconciliation).
2. Owner Console: Table Layout rebuild (canvas removal, new card-grid component, `zone` field end-to-end) + dark-theme pass on Menu/Employees/Analytics.
3. Cashier/Checkout: order identity, elapsed time, per-line prices, truncation, shift header, search/sort, demoted cancel.
4. Server/Take-Orders: compact item cards, category grouping with filters, chip-based table selection, persistent order-summary panel, kitchen notes end-to-end.
5. Responsive/tablet pass across all redesigned pages.

Each story gets its own spec with acceptance criteria; backend touches are coordinated (new `zone` and kitchen-notes fields).

### Affected Architecture

- [[AR-frontend-design-system]] documents TableLayoutEditor's canvas as a deliberate exception (\"domain-specific logic, not a typical form/table UI\"). C-35 reverses this exception: the canvas is removed entirely in favor of a zone-grouped card grid. See [[AR-frontend-design-system]]'s update note on this reversal.
