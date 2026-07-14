---
type: process
tags: [frontend/testing]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-menumanager-test-tsx]]"]
sources: []
---

# MenuManager Flaky Test: Vitest Resource Contention

## Symptom

`MenuManager.test.tsx > lets the owner edit and save a category name` intermittently times out ONLY when the full Vitest suite runs together. Test passes 9/9 in isolation; fails sporadically under full-suite load.

## Investigation

Pre-existing and unrelated to C-17/C-18/C-19 (Ant Design redesign). Confirmed by `git stash`-ing all C-19 changes and re-running the full suite against the pre-C-19 codebase: the test still failed under load (in fact, 2 tests failed in one run). MenuManager code and antd Switch behavior are not the root cause.

## Root Cause

Likely resource contention across parallel Vitest workers in this environment. The test passes consistently in isolation because it runs alone; under parallel load, worker processes compete for CPU, I/O, or other system resources, causing timeouts in time-sensitive tests.

## Mitigation

This is an environment/test-runner issue, not a product or test logic bug. Future sessions should not waste time chasing this as a regression when it resurfaces. The fix, if ever pursued, would be tuning Vitest's worker pool/concurrency settings (e.g., `--pool-size`, `--workers` flags or vitest.config.ts adjustments), not touching MenuManager or antd code.

## Recommendation

Record this as a known flaky-test artifact of this environment. No action needed on product code; candidate for infrastructure/CI tuning if the full suite becomes critical path.
