---
type: domain
tags: [code/frontend, code/testing, frontend/testing]
aliases: []
created: 2026-07-16
updated: 2026-07-16
related: []
sources: []
---

# MenuManager.test.tsx Has Pre-Existing Full-Suite Timing Flakiness

MenuManager.test.tsx contains a pre-existing intermittent timeout failure: the test "lets the owner edit and save a category name, menu item" times out at the default 5000ms when the full test suite runs in parallel, but passes reliably (10/10) when run in isolation.

**Discovery:** Confirmed during C-36's implementation (via `git stash` and re-running against pre-C-36 code) that this flakiness predates C-36 entirely. Not introduced by this ticket.

**Probable cause:** Resource contention when all tests run in parallel. The test passes quickly in isolation but competes for resources (likely DOM, timers, or API mocking) when other tests run concurrently.

**Workaround:** Run the suite serially or run MenuManager.test.tsx in isolation. Neither is ideal for CI.

**Out of scope:** C-36 did not investigate or fix this issue; it's orthogonal to the dark theme work.

**Action item:** Worth a quick-lane bug ticket to either increase MenuManager's test timeout, refactor the test to be more resistant to contention, or investigate the underlying resource bottleneck. For now, if a full-suite CI run goes red on this test in isolation, this gotcha explains why it's not a regression from the most recent ticket.
