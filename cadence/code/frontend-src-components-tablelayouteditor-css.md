---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/TableLayoutEditor.css"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[US-37]]"]
sources: []
---

# frontend/src/components/TableLayoutEditor.css

Styling for the table floor-plan canvas editor (drag/resize interaction). This canvas deliberately keeps its own fixed light color palette (peach tables on light background, white delete button) regardless of the app theme, as it represents a physical floor plan and needs its own visual identity.

## Changes (C-36)

Added explicit `color: #1f1f1f` to `.table-layout-editor__table` and `.table-layout-editor__delete`. The canvas has fixed light backgrounds (peach background for tables, white for delete button) but previously had no explicit text color, so text inherited the app's ambient color. This was fine under the old light theme (dark text on light backgrounds) but became light-on-light under the new dark theme. This is a stopgap fix scoped to C-36's "no contrast regressions on existing routes" criterion. The entire TableLayoutEditor component is being replaced by C-37's card-grid rebuild, which will handle the floor plan editor redesign comprehensively.

## Used by
- `frontend/src/components/TableLayoutEditor.tsx` -- imported for canvas styling
