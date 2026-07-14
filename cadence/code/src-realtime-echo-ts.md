---
type: file
tags: [code/frontend]
aliases: ["src/realtime/echo.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-kitchendisplay-tsx]]", "[[laravel-reverb-broadcastas-dot-prefix-gotcha]]", "[[reverb-hardcoded-host-deployment-bug]]", "[[US-6]]", "[[US-9]]", "[[US-19]]", "[[EP-14]]"]
sources: []
---

# src/realtime/echo.ts

First WebSocket client in this project, thin Laravel Echo/Reverb wrapper (C-6). Fixed in C-9 to resolve hardcoded localhost issue that broke real-time for non-host devices.

## Exports

- `getReverbConfig()` -- resolves Reverb host/port/scheme from VITE_REVERB_HOST/VITE_REVERB_PORT/VITE_REVERB_SCHEME (baked in at Vite build time), with fallback constants DEFAULT_REVERB_HOST/PORT/SCHEME for local development. Returns Echo config object suitable for both localhost dev and LAN deployment.
- `subscribeToKitchenChannel(handlers: {onOrderPlaced, onOrderUpdated})` -- lazy singleton pattern: creates Echo instance only on first subscription, subscribes to public kitchen channel, listens for '.order.placed' and '.order.updated' events (note leading dots), returns unsubscribe function

## Design patterns

**Lazy singleton:** Echo instance is created and cached on first subscription, reused for subsequent calls. Avoids spinning up the WebSocket unnecessarily.

**Mocking seam:** This module is the sole mocking point for WebSocket tests. Components that use realtime features should mock `src/realtime/echo` via `vi.mock()` and provide fake handlers.

**Event name dots:** Crucially, Echo listeners use `.order.placed` and `.order.updated` (with leading dots), while backend's broadcastAs() returns names without dots. See [[laravel-reverb-broadcastas-dot-prefix-gotcha]].

**Config resolution — C-9 fix:** Previously hardcoded to 127.0.0.1:8080/http, which silently broke WebSocket for any device except the host machine. Now reads VITE_REVERB_HOST/VITE_REVERB_PORT/VITE_REVERB_SCHEME from import.meta.env (baked in at Vite build time from POS_REVERB_HOST/PORT/SCHEME). For local dev, falls back to DEFAULT_REVERB_HOST (127.0.0.1), DEFAULT_REVERB_PORT (8080), DEFAULT_REVERB_SCHEME ('http'). See [[reverb-hardcoded-host-deployment-bug]].

## Test coverage

Tests in src/realtime/echo.test.ts verify env-var override behavior (VITE env vars correctly passed to Echo config).

## Used by
- [[src-components-kitchendisplay-tsx|src/components/KitchenDisplay.tsx]] -- subscribeToKitchenChannel() for live order updates
