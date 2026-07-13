---
type: design
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-9]]", "[[DS-1]]"]
sources: []
---

# C-9: On-Premise Deployment Setup -- Design

## Parent
Part of [[EP-1]] -- see [[DS-1]] for the umbrella rationale.

## Problem
Per [[adr-004-onpremise-deployment]], the whole system needs to run on one local machine at the restaurant with no cloud dependency, and needs to come back up reliably after a restart (power outage, reboot) without manual intervention every time.

## Approach
Package the full stack (Laravel API, PostgreSQL, Laravel Reverb, React SPA build, print agent) to run together on a single local machine, reachable by any device on the restaurant's local network via browser. Provide setup documentation or a script for standing up a fresh install, and configure services to restart automatically on machine reboot.

## Acceptance criteria
- The full stack runs together on a single local machine.
- Devices on the restaurant's local network can reach the system via browser, with no internet dependency for core operation.
- Documented setup steps or a setup script exist for a fresh installation.
- The system recovers cleanly from a machine restart (services restart automatically or documented steps bring it back up).

## Estimate
3 points

## Assignee
claude
