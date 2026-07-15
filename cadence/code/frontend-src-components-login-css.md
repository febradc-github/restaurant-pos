---
type: file
tags: [code/frontend]
aliases: ["frontend/src/components/Login.css"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[US-29]]"]
sources: []
---

# frontend/src/components/Login.css

Login page component styling. Added `text-align: center` to `.login` rule in C-29 to restore centered Title/Alert text alignment. Login was previously relying on `#root`'s now-removed `text-align: center` landing-page constraint; this change makes Login self-contained and independent of global app-shell styling.

## Exports
- `.login` -- login form container (includes text-align: center)

## Imports
- `frontend/src/components/Login.tsx` -- component using this stylesheet
