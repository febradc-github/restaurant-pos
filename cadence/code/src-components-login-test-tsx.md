---
type: file
tags: [code/frontend]
aliases: ["src/components/Login.test.tsx"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[src-components-login-tsx]]", "[[US-30]]"]
sources: []
---

# src/components/Login.test.tsx

Test suite for Login.tsx using vitest and React Testing Library. Covers form submission (valid/invalid credentials), error display, and touch-target compliance. Mocks global fetch to control API responses. Tests use accessible queries: `getByLabelText` for form fields by label, `getByRole` for button/alert discovery.

Added in [[US-30]]: test asserting email Input, password Input.Password, and submit Button all carry `size="large"` (verified by `ant-input-affix-wrapper-lg` and `ant-btn-lg` class presence) to meet 44px+ touch-target minimum.

## Exports
- test suite only (no exports)

## Imports
- `vitest` -- describe, it, beforeEach, afterEach, expect, vi
- `@testing-library/react` -- render, screen, waitFor
- `@testing-library/user-event` -- userEvent for realistic interactions
- [[src-components-login-tsx|src/components/Login.tsx]] -- component under test
- [[src-types-auth-ts|src/types/auth.ts]] -- AuthSession type for mock data

## Used by
- Test runner (vitest) in dev/CI pipeline
