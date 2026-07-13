---
type: file
tags: [code/backend]
aliases: ["config/reverb.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[reverb-env-config-no-dotenv]]"]
sources: []
---

# config/reverb.php

Reverb WebSocket server configuration, published via `php artisan vendor:publish --tag=reverb-config` (C-6).

## Role

Configures the Reverb server behavior: app ID, keys, host, port, TLS. All values resolve from environment variables (OS-level, not .env).
