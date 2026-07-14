---
type: file
tags: [code/backend]
aliases: ["backend/tests/Feature/Employees/EmployeeStoreTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[backend-app-http-controllers-api-employeecontroller-php]]", "[[US-21]]", "[[EP-20]]"]
sources: []
---

# backend/tests/Feature/Employees/EmployeeStoreTest.php

Feature tests for EmployeeController::store() endpoint. Verifies: employee creation with correct role-conditional validation (email+password for Owner/Cashier/Server, 6-digit PIN for Kitchen); duplicate email rejection; duplicate PIN rejection; Kitchen employees created with placeholder credentials; response includes correct shape with has_pin flag and masked email (null for Kitchen).
