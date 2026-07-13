---
type: file
tags: [code/frontend]
aliases: ["src/realtime/echo.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[laravel-reverb-broadcastas-dot-prefix-gotcha]]"]
sources: []
---

# src/realtime/echo.ts

First WebSocket client in this project, thin Laravel Echo/Reverb wrapper (C-6).

## Exports
- `getReverbConfig()` -- resolves Reverb host/port/key from VITE env vars, returns Echo config object
- `subscribeToKitchenChannel(handlers: {onOrderPlaced, onOrderUpdated})` -- lazy singleton pattern: creates Echo instance only on first subscription, subscribes to public kitchen channel, listens for '.order.placed' and '.order.updated' events (note leading dots), returns unsubscribe function

## Design patterns

**Lazy singleton:** Echo instance is created and cached on first subscription, reused for subsequent calls. Avoids spinning up the WebSocket unnecessarily.

**Mocking seam:** This module is the sole mocking point for WebSocket tests. Components that use realtime features should mock `src/realtime/echo` via `vi.mock()` and provide fake handlers.

**Event name dots:** Crucially, Echo listeners use `.order.placed` and `.order.updated` (with leading dots), while backend's broadcastAs() returns names without dots. See [[laravel-reverb-broadcastas-dot-prefix-gotcha]].

**Config resolution:** VITE_REVERB_APP_KEY read from import.meta.env with fallback 'local-reverb-key'. Host fixed to 127.0.0.1, port 8080, forceTLS false (development defaults).

## Future pattern

This is the template future Reverb-consuming components should follow: lazy subscribe via subscribeToKitchenChannel(), handle both 'onOrderPlaced' and 'onOrderUpdated', invoke the returned unsubscribe on cleanup.
