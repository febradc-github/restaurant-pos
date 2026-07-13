---
type: domain
tags: [code/backend, code/frontend]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-6]]"]
sources: []
---

# Laravel Reverb broadcastAs() / Client-Side Dot-Prefix Gotcha

Laravel's `broadcastAs()` method on a `ShouldBroadcast` event returns an event name WITHOUT the leading dot, but Laravel Echo / Pusher client-side listeners require a leading dot to subscribe.

**The trap:** `broadcastAs('order.placed')` on the backend must be subscribed to as `'.order.placed'` (with leading dot) on the frontend. Omitting the dot silently fails — no error thrown, just no listener fires.

**C-6 experience:** Initial KitchenDisplay.tsx had `channel.listen('order.placed')` instead of `channel.listen('.order.placed')`. Orders placed zero listener hits; reconnecting did not help. Adding the leading dot fixed it.

**Pattern for future Reverb work:** Always verify that Echo listeners use `.broadcastAs()` return value in client code. Automate this check if possible (e.g. grep for both the server-side `broadcastAs()` and the client-side `.listen()` call to confirm they match, including the dot).
