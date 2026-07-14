---
type: domain
tags: [code/frontend, frontend/known-gaps]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-21]]", "[[US-22]]", "[[EP-20]]", "[[backend-app-http-controllers-api-employeecontroller-php]]"]
sources: []
---

# Frontend Employee Credential Crossing Validation Gap

C-21's review identified that the backend's `PATCH /api/employees/{id}` endpoint does not require a new credential when an employee's role crosses the login-role/Kitchen boundary (e.g., Cashier → Kitchen with no PIN supplied, or Kitchen → Owner with no password supplied). This could leave an account unusable because the account would be missing the credential required for its new role's authentication method.

## C-22 UI-Layer Mitigation

Because fixing the backend (making credential required on role crossing) remained out-of-scope for both C-21 and C-22, the Employee Management UI (C-22) closes this gap at the client layer:

In `EmployeeManager`'s edit modal, a `crossingAuthBoundary` check compares the employee's *current* role (a login role like Owner/Cashier/Server vs. Kitchen) against the *newly selected* role in the form. When they differ in authentication method, the corresponding credential field (PIN for Kitchen, password for login roles) gains a `required: true` antd form rule: "A new PIN/password is required when changing this role." This blocks form submission until the field is filled.

## Scope Limitation

This mitigation is **UI-only**. The backend API itself still technically accepts the unsafe request if called directly via curl, Postman, or any other tool that bypasses the React form validation. The gap is guarded at the one UI surface that exists (OwnerPage's employee editor), but not hardened in the API contract itself.

A full backend hardening ticket (adding credential validation logic to the controller's update method) remains open if someone wants to file it later.
