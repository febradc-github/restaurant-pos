---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/Auth/LoginTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[tests-feature-auth-logouttest-php]]", "[[app-http-controllers-api-authcontroller-php]]", "[[app-models-timeentry-php]]", "[[US-11]]", "[[US-21]]", "[[EP-10]]", "[[EP-20]]"]
sources: []
---

# backend/tests/Feature/Auth/LoginTest.php

Feature tests for Sanctum login endpoint. Verifies: Server login creates a Sanctum bearer token via existing auth flow; Cashier login creates time_entries row with clock_in; Server login creates time_entries row with clock_in; Owner login does not create time_entries row (excluded from time tracking); deactivated user login rejection (C-21) with identical 422 response to wrong password (verified byte-for-byte, no enumeration).

## Exports
- Test cases for login action: token issuance, time_entries creation for Cashier/Server, Owner exclusion, deactivated user rejection
