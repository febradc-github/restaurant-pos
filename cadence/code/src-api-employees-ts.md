---
type: file
tags: [code/frontend]
aliases: ["src/api/employees.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-types-employee-ts]]", "[[src-api-employees-test-ts]]", "[[src-components-employeemanager-tsx]]", "[[backend-app-http-controllers-api-employeecontroller-php]]", "[[US-22]]", "[[EP-20]]"]
sources: []
---

# src/api/employees.ts

API client factory for employee management. Mirrors src/api/menu.ts pattern: exports `createEmployeesApi({baseUrl, token})` returning { list, create, update, deactivate, reactivate } methods. All methods hit `/api/employees...` endpoints per the C-21 contract.

The client's `handleResponse` wrapper parses Laravel's 422 Unprocessable Entity response shape `{message, errors}` and throws an Error whose message is the specific field error (e.g., "Self-deactivation not allowed" or "Cannot deactivate last active Owner"). This surfaces backend guard rejections (self-deactivation, last-active-Owner) to the UI Alert in EmployeeManager.

## Exports
- `createEmployeesApi(config)` -- factory returning { list, create, update, deactivate, reactivate }
- `handleResponse(response)` -- error wrapper parsing 422 errors

## Imports
- `src/types/employee` -- Employee type
- fetch (browser API)

## Used by
- [[src-components-employeemanager-tsx|src/components/EmployeeManager.tsx]] -- CRUD operations
