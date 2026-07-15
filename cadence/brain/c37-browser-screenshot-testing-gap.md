---
type: process
tags: [code/testing, code/frontend]
aliases: []
created: 2026-07-16
updated: 2026-07-16
related: ["[[US-37]]", "[[US-38]]", "[[US-39]]"]
sources: []
---

# C-37: Browser/Screenshot Tooling Gap for UI Verification

C-37 is a UI-heavy ticket (full redesign of the table grid from canvas to card layout). No browser automation or screenshot-capture tooling is available in this environment.

**Coverage substitute**: component-level test assertions verified the shipped UI:
- CSS class names (`table-layout-editor__card`, `table-layout-editor__card--occupied`, etc.)
- Computed `style.background` values against theme tokens (`colorSuccessBg`, `colorErrorBg`) to confirm color-coding behavior
- testid and heading presence to verify zone grouping and detail panel structure
- API-level end-to-end smoke test: `curl` against a migrated+seeded dev database to confirm `zone` and `is_occupied` fields round-trip correctly through the real API and match expected computed values

**Limitation**: No visual confirmation that the grid layout, card spacing, text alignment, or responsive breakpoint behavior actually render as intended. This is a standing limitation for any future UI-redesign ticket (US-38/US-39 will hit the same gap).

**Recommendation**: Future UI-heavy stories should call this out early and consider whether temporary screenshot/video capture (manual, scripted browser, or other ad-hoc method) is worth the effort.
