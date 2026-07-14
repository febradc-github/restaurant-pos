---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/Analytics/AnalyticsSalesTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-http-controllers-api-analyticscontroller-php]]", "[[app-models-order-php]]", "[[backend-tests-feature-timeentries-timeentryindextest-php]]", "[[US-24]]"]
sources: []
---

# backend/tests/Feature/Analytics/AnalyticsSalesTest.php

Feature tests for GET /api/analytics/sales endpoint.

## Tests (7)
- Authorization: requires auth:sanctum + role:owner (unauthenticated and non-owner roles are rejected)
- Non-Paid order exclusion: Pending/Cancelled orders do not contribute to revenue totals
- Multi-day revenue grouping: multiple paid_at timestamps across different dates produce separate grouped rows
- from/to range filtering: passed as optional query params, both sides are inclusive and optional (open-ended ranges work)
- to-bound inclusivity: date-only `to` value includes same-day paid_at entries with time components (e.g., `to=2026-07-05` includes entries paid at `2026-07-05 23:59:59`), mirroring `TimeEntryIndexTest`'s equivalent pattern

## Design
Uses Order factory with explicit paid_at timestamps to test date boundaries and grouping logic independently of current time.
