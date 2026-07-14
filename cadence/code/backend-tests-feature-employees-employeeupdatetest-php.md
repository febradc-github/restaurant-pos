---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/Employees/EmployeeUpdateTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[backend-app-http-controllers-api-employeecontroller-php]]", "[[US-21]]", "[[EP-20]]"]
sources: []
---

# backend/tests/Feature/Employees/EmployeeUpdateTest.php

Feature tests for EmployeeController::update() endpoint. Verifies: role changes with correct database updates; credential reset (password for login roles, PIN for Kitchen); response includes updated shape.
