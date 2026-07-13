---
type: file
tags: [code/backend]
aliases: ["routes/channels.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[bootstrap-app-php]]", "[[app-events-orderplaced-php]]", "[[app-events-orderstatusupdated-php]]"]
sources: []
---

# routes/channels.php

Broadcast channel registration, created in C-6.

## Exports
- Public Channel('kitchen') registration for order broadcasts

## Design

Only the public kitchen channel is registered. No authorization logic (public channels do not invoke authorization methods in Laravel Reverb). This file is wired into bootstrap via `withBroadcasting()`.
