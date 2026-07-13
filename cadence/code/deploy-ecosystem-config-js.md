---
type: file
tags: [code/root, deployment]
aliases: ["deploy/ecosystem.config.js"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[reverb-env-config-no-dotenv]]", "[[AR-print-agent-polyglot]]", "[[deploy-setup-sh]]", "[[US-9]]", "[[EP-1]]"]
sources: []
---

# deploy/ecosystem.config.js

PM2 ecosystem configuration for on-premise deployment. Defines and supervises 4 processes (Laravel backend, Laravel Reverb WebSocket, Node print-agent, Node static frontend server) with environment isolation, startup order, and restart recovery.

## Environment Variables (read at PM2 startup)

- `POS_DB_PASSWORD` — MySQL password for Laravel, defaults to `CHANGE_ME_DB_PASSWORD`
- `POS_REVERB_APP_ID`, `POS_REVERB_APP_KEY`, `POS_REVERB_APP_SECRET` — Reverb secrets (dev defaults provided), read by both backend config and frontend build
- `POS_PHP_DIR` — PHP installation directory; falls back to PATH detection; fails at config load if neither available

This approach centralizes secrets injection at deploy time without committing .env files or hardcoding paths to developer machines.

## Processes Defined

1. **pos-backend** — `php artisan serve --host=0.0.0.0 --port=8000`
2. **pos-reverb** — `php artisan reverb:start --host=0.0.0.0 --port=8080`
3. **pos-print-agent** — Node.js process running `dist/index.js` with PRINT_AGENT_PORT=4000
4. **pos-frontend** — Node.js static server (see [[deploy-static-server-js]]) on port 3000

All restart on crash; `pm2 save` persists state across OS reboots (via pm2 startup on Unix, pm2-windows-startup on Windows).

## Verified

All 4 processes start and health-check on loopback (127.0.0.1) and LAN IP (192.168.31.5 during testing). Reverb WebSocket port confirmed open via TCP. Print-agent full HTTP→validation→ESC/POS→TCP pipeline confirmed reachable. Restart recovery validated via `pm2 kill` + `pm2 resurrect` simulation.
