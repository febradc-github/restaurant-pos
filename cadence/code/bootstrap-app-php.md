---
type: file
tags: [code/backend]
aliases: ["bootstrap/app.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[routes-channels-php]]", "[[config-broadcasting-php]]"]
sources: []
---

# bootstrap/app.php

Application bootstrap configuration, modified in C-6 to register broadcasting.

## Change in C-6

Added `->withBroadcasting(__DIR__.'/../routes/channels.php', attributes: ['prefix' => 'api', 'middleware' => ['api']])` to enable channel authorization and registration. This wires the channels.php route file into the bootstrap sequence.
