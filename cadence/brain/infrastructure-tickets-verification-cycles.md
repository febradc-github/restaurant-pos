---
type: process
tags: [process/estimation, deployment]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-9]]"]
sources: []
---

# Infrastructure Tickets and Verification Cycles

Deployment and infrastructure tickets (process supervision, secrets handling, environment configuration) tend to require multiple verification-driven passes even when core implementation is sound. This pattern should inform estimation.

## Pattern

[[US-9]] (3-point estimate) required three passes to reach reviewable state:

1. **Core implementation**: PM2 setup, scripts, docs — legitimately matched 3-point scope
2. **Security/hygiene fix**: Pass 1's core was functionally complete but had real defects (hardcoded secrets, personal paths in committed config) caught during verification
3. **Documentation accuracy fix**: Pass 1's own troubleshooting docs were incomplete; follow-up testing revealed gaps

Each pass was legitimate — real defects and accuracy issues, not thrashing.

## Lesson for Estimation

Infrastructure tickets are more prone to this cycle than application code with unit-test coverage:

- **Application features**: unit tests during development catch most defects before verification starts; pass rate is high on first submission
- **Infrastructure/deployment**: verification is the primary test surface (live process supervision, actual config handling, environment-specific behavior); defects and accuracy gaps emerge during live verification, not during build

Consider a +1-2 point buffer in future breakdowns for infrastructure tickets of similar scope, to account for expected verification-driven follow-up work that is not busywork but necessary for production safety and accuracy.
