---
type: file
tags: [code/frontend]
aliases: ["src/components/EmployeeManager.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-types-employee-ts]]", "[[src-api-employees-ts]]", "[[src-components-employeemanager-css]]", "[[src-components-employeemanager-test-tsx]]", "[[src-components-ownerpage-tsx]]", "[[frontend-employee-credential-crossing-validation-gap]]", "[[US-22]]", "[[EP-20]]"]
sources: []
---

# src/components/EmployeeManager.tsx

Owner-facing employee CRUD UI rendered at `/owner/employees` route. Displays a Card with a Table listing all employees (name, role, active status) and inline Add/Edit/Deactivate/Reactivate actions.

Add-Employee uses a Form (`name="add-employee"`) with Form.useWatch('role') to conditionally reveal credential fields: PIN field for Kitchen, email+password fields for Owner/Cashier/Server.

Edit-Employee uses a Modal+Form (`name="edit-employee"`) rather than the editable-cell pattern (used in MenuManager/TableLayoutEditor) because the credential field's identity must react live to role selection during editing. The modal also implements the frontend-employee-credential-crossing-validation-gap mitigation: a `crossingAuthBoundary` check compares the employee's current role against the newly selected role; when they differ, the relevant credential field gains `required: true` ("A new PIN/password is required when changing this role."), blocking submission until filled.

Deactivate is Popconfirm-gated (meaningful, hard-to-undo action). Reactivate is immediate. Backend 422 `errors.user` messages (self-deactivation, last-active-Owner rejections) are rendered via an Alert.

## Exports
- `EmployeeManager` component (React.FC<{authToken?: string | null}>)

## Imports
- `src/api/employees` -- API client
- `src/types/employee` -- Employee type
- `antd` -- Card, Form, Table, Input, Select, Button, Modal, Popconfirm, Alert, Space
- [[src-components-employeemanager-css|src/components/EmployeeManager.css]] -- styling
- React, useState, useEffect, useCallback

## Used by
- [[src-components-ownerpage-tsx|src/components/OwnerPage.tsx]] -- mounted at `/owner/employees` route
