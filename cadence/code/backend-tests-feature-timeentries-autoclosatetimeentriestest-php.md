---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/TimeEntries/AutoCloseTimeEntriesTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[backend-console-commands-closeforgottentimeentries-php]]", "[[app-models-timeentry-php]]", "[[database-factories-timeentryfactory-php]]", "[[US-13]]", "[[EP-10]]"]
sources: []
---

# backend/tests/Feature/TimeEntries/AutoCloseTimeEntriesTest.php

Feature tests for the auto-close scheduled job. Verifies correct cutoff computation and closure behavior across entry ages, cutoff times, users, and roles.

## Exports
- 5 test cases:
  - Previous-day stale entry closed on next run
  - Today's not-yet-due entry left untouched
  - Same-day cutoff-just-passed entry closed
  - Normally-closed entries never touched by the job
  - Multiple users and roles closed together in one run
