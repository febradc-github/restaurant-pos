---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/Auth/LogoutTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[tests-feature-auth-logintest-php]]", "[[app-http-controllers-api-authcontroller-php]]", "[[app-models-timeentry-php]]", "[[US-11]]", "[[EP-10]]"]
sources: []
---

# backend/tests/Feature/Auth/LogoutTest.php

Feature tests for Sanctum logout endpoint. Verifies: logout action closes caller's open time_entries row (clock_out set to now()); Owner logout is a no-op re time_entries (no row to close); cross-user isolation (one user's logout never closes another user's open entry); when multiple open rows exist for same user, logout picks the latest by clock_in to close.

## Exports
- Test cases for logout action: time_entries closure, Owner exclusion, user isolation, last-open precedence
