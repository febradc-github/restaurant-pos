---
type: spec
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-9]]", "[[DS-9]]"]
sources: []
---

# C-9: On-Premise Deployment Setup -- Spec

## Acceptance criteria
- [ ] The full stack (Laravel API, PostgreSQL, Laravel Reverb, React SPA, print agent) runs together on a single local machine.
- [ ] Devices on the restaurant's local network can reach the system via browser, with no internet dependency for core operation.
- [ ] Documented setup steps or a setup script exist for a fresh installation.
- [ ] The system recovers cleanly from a machine restart (services restart automatically or documented steps bring it back up).

## Out of scope
- Multi-machine/high-availability deployment (single-machine only, per [[adr-004-onpremise-deployment]]).
- Automated backup/restore tooling (not discussed; worth raising separately).

## Reference
See [[DS-9]] for rationale and trade-offs.
