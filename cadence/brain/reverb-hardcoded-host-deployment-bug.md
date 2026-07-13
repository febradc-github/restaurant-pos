---
type: domain
tags: [code/frontend, deployment]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-realtime-echo-ts]]", "[[US-9]]", "[[laravel-reverb-broadcastas-dot-prefix-gotcha]]"]
sources: []
---

# Reverb Host Hardcoding: Silent Deployment Failure

## The Bug

During C-9 (On-Premise Deployment), discovered that `src/realtime/echo.ts` hardcoded Reverb host/port/scheme to 127.0.0.1:8080/http regardless of environment. This was a latent deployment bug: WebSocket real-time features (live order updates, kitchen display) would silently fail for any device except the host machine once deployed to a real restaurant LAN.

Example: A tablet on a different LAN IP (192.168.31.10) connecting to a POS box on 192.168.31.5 would try to reach 127.0.0.1:8080 (the other device's loopback), not the actual Reverb server.

## Root Cause

`getReverbConfig()` returned Echo config with hardcoded `host: '127.0.0.1'`. Vite build-time environment variables (VITE_REVERB_HOST/PORT/SCHEME) existed in CI/deployment but were never wired into the frontend code.

## Resolution (C-9)

Updated `getReverbConfig()` to read VITE_REVERB_HOST/VITE_REVERB_PORT/VITE_REVERB_SCHEME from import.meta.env, with fallback constants (DEFAULT_REVERB_HOST=127.0.0.1, DEFAULT_REVERB_PORT=8080, DEFAULT_REVERB_SCHEME='http') for local dev. These env vars are passed at Vite build time from deploy/ecosystem.config.js (POS_REVERB_HOST/PORT/SCHEME).

Added 2 new tests in src/realtime/echo.test.ts to verify env-var override behavior.

Added typed ImportMetaEnv fields in src/vite-env.d.ts.

**Why it wasn't caught until deployment:** Feature works on localhost dev (both browser and backend on same machine), so all local testing passes. The bug manifests only when the frontend is built with one LAN IP and browsers access it from a different device. A full LAN deployment test would have caught this.

## Lesson

**Build-time env vars are invisible.** When splitting config between build-time (Vite's import.meta.env) and runtime (process.env in Node), document which is which and test the actual build artifact in the deployment environment, not just localhost dev.
