---
type: domain
tags: [backend]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-21]]", "[[US-22]]", "[[EP-20]]"]
sources: []
---

# Password Validation: min:8 Default (Open Question)

Employee password validation in EmployeeController::store() and EmployeeController::update() uses a generic `min:8` rule. No pre-existing password-strength convention existed elsewhere in the codebase to match.

## Decision

Picked min:8 as a reasonable baseline default for C-21. This should be revisited during C-22 (Employee Management UI) or product requirements review to confirm whether stronger rules are needed (e.g., Laravel's Password::defaults(), uppercase/digit/special-character requirements, dictionary checks).

Flag for whoever builds C-22 or next product review cycle.
