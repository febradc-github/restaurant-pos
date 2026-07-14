---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/Kitchen/ClockTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[backend-app-http-controllers-api-kitchenclockcontroller-php]]", "[[US-12]]", "[[EP-10]]"]
sources: []
---

# backend/tests/Feature/Kitchen/ClockTest.php

Feature tests for PIN-based clock in/out (C-12). Nine test cases covering:
- Clock-in creates a time_entries row with clock_out NULL
- Second submission with same PIN closes the entry (clock-out)
- Repeated toggles across multiple submissions
- Malformed PIN returns 422 with 'Invalid PIN.'
- Valid-format unrecognized PIN returns identical 422 error (no enumeration)
- No auth:sanctum token required regression check
- Response includes employee name on success
- Response structure validation

All tests use the UserFactory `->kitchen()` state for test user creation.
