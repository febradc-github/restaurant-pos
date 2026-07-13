---
type: design
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-2]]", "[[DS-1]]"]
sources: []
---

# C-2: Authentication & Role-Based Access -- Design

## Parent
Part of [[EP-1]] -- see [[DS-1]] for the umbrella rationale.

## Problem
The system defines four roles (Owner, Cashier, Server, Kitchen) with different capabilities, but only Owner and Cashier need individual identity and authentication -- Server and Kitchen are device-level views. Without enforced role checks, any device on the network could perform Owner-only or Cashier-only actions (editing the table layout, confirming payment, etc.).

## Approach
Implement Laravel authentication (e.g. Sanctum) for Owner and Cashier accounts, with a role field distinguishing the two. Server and Kitchen routes/views require no login. Every API endpoint enforces its required role server-side (via middleware/policies), not just hidden in the frontend, so a Server or Kitchen device cannot call an Owner- or Cashier-only endpoint even if it guesses the URL.

## Acceptance criteria
- Owner and Cashier can log in with an identifier (e.g. email or username) and password.
- Server and Kitchen views are accessible without login.
- Each of the four roles has a distinct permission set enforced at the API level.
- An unauthenticated or wrong-role request to an Owner-only or Cashier-only endpoint is rejected by the backend (not just hidden in the UI).
- Owner and Cashier sessions persist for a reasonable working session (exact duration confirmed at spec time).

## Estimate
5 points

## Assignee
claude
