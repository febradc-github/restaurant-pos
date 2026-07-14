---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/TimeEntries/TimeEntryIndexTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-http-controllers-api-timeentrycontroller-php]]", "[[app-models-timeentry-php]]", "[[database-factories-timeentryfactory-php]]", "[[US-13]]", "[[EP-10]]"]
sources: []
---

# backend/tests/Feature/TimeEntries/TimeEntryIndexTest.php

Feature tests for GET /api/time-entries endpoint. Verifies auth, authorization, response format, and all query parameter filters.

## Exports
- 8 test cases:
  - Auth required (unauthenticated 401)
  - Non-owner forbidden (auth'd non-owner 403)
  - Default listing includes `auto_closed` field
  - Filter by `user_id`
  - Filter by `role`
  - Filter by date range (from/to)
  - `to`-bound inclusivity (end-of-day normalization)
  - All filters combined (user_id + role + from + to)
