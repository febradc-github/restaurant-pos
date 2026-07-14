---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/Employees/EmployeeIndexTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[backend-app-http-controllers-api-employeecontroller-php]]", "[[US-21]]", "[[EP-20]]"]
sources: []
---

# backend/tests/Feature/Employees/EmployeeIndexTest.php

Feature tests for EmployeeController::index() endpoint. Verifies list endpoint returns all employees with correct response shape: `{id, name, email, role, active, has_pin}`.
