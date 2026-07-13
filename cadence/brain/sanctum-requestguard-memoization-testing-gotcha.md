---
type: process
tags: [backend/testing]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-2]]"]
sources: []
---

# Sanctum RequestGuard Memoization in Tests

In Laravel Sanctum, the RequestGuard resolves and memoizes the authenticated user for the lifetime of the request/test container. This is transparent in real HTTP requests (each boots a fresh container), but causes an artifact in multi-call test methods: a token revoked mid-test can still appear "authenticated" on a later HTTP call within the same test method unless Auth::forgetGuards() is called between requests.

When writing multi-call auth tests (e.g. login, logout, then a follow-up request), call Auth::forgetGuards() after logout to clear the memoized guard state before the next request.

This does not affect production behavior.
