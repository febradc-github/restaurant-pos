---
type: domain
tags: [backend/database]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-types-employee-ts]]", "[[frontend-employee-credential-crossing-validation-gap]]", "[[US-21]]", "[[US-22]]", "[[EP-20]]", "[[backend-app-http-controllers-api-employeecontroller-php]]", "[[app-models-user-php]]"]
sources: []
---

# Kitchen Employees Placeholder Credentials (Schema Constraint)

Kitchen employees created via EmployeeController::store() receive internal placeholder credentials because the pre-C-21 `users` table schema defines `email` and `password` as `NOT NULL` columns that predate Kitchen's PIN-only auth (C-12). Making them nullable would require doctrine/dbal (not a project dependency) to support the `->change()` migration operation.

## Implementation

Instead of adding the dependency:
- **Placeholder email**: `kitchen-<uuid>@internal.invalid` (always masked as `null` in API responses, never exposed)
- **Placeholder password**: random 40-character string (never exposed in API responses)

Both are masked in every response shape by EmployeeController (email is always `null` for Kitchen; password is never returned for any role). This pattern mirrors UserFactory::kitchen() which has used the same approach since C-12 for identical schema reasons.

## Avoiding Confusion

A future ticket examining the `users` table directly might see `kitchen-*@internal.invalid` email addresses and mistake them for a bug. They are intentional and safe -- no actual Kitchen user (PIN-based only) can log in via email/password, and these credentials are never handed to Kitchen staff or exposed in any response.
