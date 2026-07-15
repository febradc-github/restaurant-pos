---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/TableLayoutEditor.test.tsx"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[US-31]]"]
sources: []
---

# frontend/src/components/TableLayoutEditor.test.tsx

Test suite for TableLayoutEditor component (floor plan editor for table layout configuration).

## Changes (C-31)

Added regression test to re-verify the epic's origin bug fix from C-29. The test ensures that the "Floor Plan" heading maintains its accessible name and that the canvas renders at explicit 800x600 dimensions. This prevents regression of C-29's app-shell accessibility improvements.

## Test Coverage
- Accessible heading name verification (validates C-29 fix is preserved)
- Canvas rendering dimensions (800x600 explicit size)

## Related Work
- C-29 app-shell fix provided the origin context for this regression verification
- No source changes needed in TableLayoutEditor.tsx itself; test-only addition
