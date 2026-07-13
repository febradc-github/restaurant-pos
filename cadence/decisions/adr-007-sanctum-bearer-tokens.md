---
type: decision
tags: [backend]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-2]]"]
sources: []
---

# ADR-007: Sanctum Bearer Tokens vs SPA Cookie Auth

## Context
This is a decoupled API (Laravel backend at D:\Projects\POS\backend) + separate React SPA frontend. Both authentication methods are viable in Sanctum, but have different tradeoffs.

## Decision
Use Sanctum's plain bearer-token issuance (createToken()->plainTextToken), not Sanctum's SPA cookie-session mode.

## Rationale
- Bearer tokens avoid needing SANCTUM_STATEFUL_DOMAINS and CORS-credentials configuration.
- Simpler deployment: no same-origin cookie assumptions, works across any frontend deployment.
- Aligns with the API-first architecture: each platform (mobile, web, other) receives an opaque token over HTTPS.
- Role middleware and route model are auth-method-agnostic, so future swaps are low-cost.

## Alternatives Rejected
**SPA Cookie Auth**: Sanctum's SPA mode uses stateful cookies + CSRF tokens. Requires SANCTUM_STATEFUL_DOMAINS to name the frontend domain and CORS-credentials handling on the SPA. Couples frontend domain to backend configuration.

## Future
If a future ticket wants httpOnly-cookie SPA auth instead, that's a swap of the login flow only (createToken() with cookie issuance instead of plainTextToken response).
