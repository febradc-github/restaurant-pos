---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/Employees/EmployeeDeactivateTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[backend-app-http-controllers-api-employeecontroller-php]]", "[[US-21]]", "[[EP-20]]"]
sources: []
---

# backend/tests/Feature/Employees/EmployeeDeactivateTest.php

Feature tests for EmployeeController::deactivate()/reactivate() endpoints. Verifies: deactivation sets `active=false` (422 on self-deactivation, 422 on deactivating last active Owner); reactivation sets `active=true`; deactivate/reactivate never modify existing time_entries or orders rows (non-destructive); response includes updated active state.
