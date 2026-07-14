---
type: file
tags: [code/frontend]
aliases: ["src/types/employee.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-api-employees-ts]]", "[[src-components-employeemanager-tsx]]", "[[US-22]]", "[[EP-20]]"]
sources: []
---

# src/types/employee.ts

TypeScript type definitions for Employee records. Matches the C-21 API response shape returned by GET /api/employees and PATCH /api/employees/{id}.

## Exports
- `Employee` -- { id: number, name: string, email: string | null, role: 'owner' | 'cashier' | 'server' | 'kitchen', active: boolean, has_pin: boolean }

`email` is null for Kitchen employees (masked by EmployeeController per kitchen-employees-placeholder-credentials-schema-constraint). `has_pin` is a boolean presence flag, not the raw PIN value.
