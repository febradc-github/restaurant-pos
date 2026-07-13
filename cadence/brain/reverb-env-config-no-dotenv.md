---
type: infrastructure
tags: [deployment, code/backend]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-6]]", "[[US-9]]", "[[deploy-ecosystem-config-js]]"]
sources: []
---

# Reverb Environment Configuration — No .env File

C-6 introduced Reverb (WebSocket broadcasting) to the project with an explicit constraint: **no interactive artisan commands** that write to `.env`, which is a hard rule in this project.

## What was done in C-6

1. `config/reverb.php` published via `php artisan vendor:publish --tag=reverb-config` (not the interactive `reverb:install`)
2. `config/broadcasting.php` manually recreated from Laravel's vendor stub (interactive `install:broadcasting` was skipped for the same reason)
3. All Reverb/broadcasting environment variables set as **OS-level User-scope environment variables**, NOT in any `.env` file:
   - `BROADCAST_CONNECTION`
   - `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`
   - `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME`
   - `VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME`

## Resolution in C-9 (On-Premise Deployment)

For on-premise deployment where OS User-scope variables aren't practical, C-9 resolved this by adopting **PM2 as process supervisor** with environment variables defined natively in `ecosystem.config.js` (PM2's own mechanism, not .env). The 4 processes (pos-backend, pos-reverb, pos-print-agent, pos-frontend) each have their env block defined in the ecosystem config, with secrets reading from POS_DB_PASSWORD, POS_REVERB_APP_ID/KEY/SECRET environment variables at PM2 startup time, falling back to obvious placeholder values if unset. PHP directory is resolved via POS_PHP_DIR or PATH detection, failing loudly at config-load time if unavailable.

This approach:
- Avoids .env files entirely (preserves the original constraint)
- Centralizes process management, startup order, and restart recovery
- Allows secrets to be injected at deploy time without committing them
- Platform-agnostic (Unix systemd/launchd-equivalent via pm2-startup; Windows via pm2-windows-startup)

See [[deploy-ecosystem-config-js]] for implementation.
