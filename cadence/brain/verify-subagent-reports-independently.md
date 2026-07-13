---
type: process
tags: [process/verification, backend/testing]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-2]]", "[[EP-1]]"]
sources: []
---

# Verify subagent reports independently

Never accept a cadence-coder (or any agent) completion report — "tests pass," "N files changed," "routes wired," etc. — as ground truth. Always independently verify:

1. **Test results**: Re-run the full test suite command yourself (e.g., `php artisan test`). Subagent claims like "16 tests, 36 assertions, all passed" can hide real failures on disk.

2. **File changes**: Read the modified files back off disk after the dispatch completes, not from memory. A reported change to bootstrap/app.php may never have been saved; User.php may still lack the HasApiTokens trait the report described.

3. **Functional verification**: If routes, casts, or middleware are involved, exercise them directly to confirm they work end-to-end.

## Why this matters

During [[US-2]] implementation, the first coder dispatch reported success but the three claimed files were Laravel scaffold defaults—never saved. Routes 404'd, User::createToken() failed. A second dispatch with explicit instructions to show raw test output and re-read files afterward fixed it. Independent re-runs on both passes confirmed the actual state.

## Application

This project ([[EP-1]]) has 7 more stories (C-3 through C-9) requiring coder dispatches. Check this note before trusting future reports.
