---
type: file
tags: [code/root, deployment]
aliases: ["deploy/README.md"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[deploy-ecosystem-config-js]]", "[[deploy-setup-sh]]", "[[US-9]]", "[[EP-1]]"]
sources: []
---

# deploy/README.md

Complete on-premise deployment documentation for the POS system. Covers setup, environment configuration, LAN access, restart recovery, and two critical troubleshooting gotchas with PM2's daemon PATH caching.

## Key Concepts

**REVERB_HOST vs VITE_REVERB_HOST:** Reverb WebSocket server needs two addresses:
- `REVERB_HOST=127.0.0.1` — what the Laravel backend uses to reach Reverb locally (hardcoded to loopback)
- `VITE_REVERB_HOST=<machine LAN IP>` — baked into the frontend build at Vite build time; what browsers on OTHER devices use to connect (e.g., 192.168.31.5)

Forgetting this distinction breaks real-time features (WebSocket) for any device except the host machine.

**Restart Recovery:** Configured via PM2's `pm2 startup` (Unix/Linux), which registers a system service, or `pm2-windows-startup install` (Windows), which writes a Run-key entry. The existing ecosystem.config.js (ecosystem.config.js) loads the saved process list and restarts all 4 processes.

## Critical Troubleshooting

1. **PM2 daemon caches its own PATH at spawn time.** If a daemon is started before PHP is on the system PATH, it will keep failing "Script not found" even after POS_PHP_DIR is set, because POS_PHP_DIR only feeds the per-process env block (for the child processes), not the daemon's own executable-resolution step. Fix: run `pm2 kill` (stops the daemon) from a shell that DOES have php on its real PATH, then `pm2 start`.

2. **Frontend build caches VITE_REVERB_HOST at build time.** If the machine's LAN IP changes or the frontend is rebuilt on a different machine, the old IP bakes into the bundle. Browsers will try to connect to the old address. Fix: rebuild the frontend on the deployment machine, or pass VITE_REVERB_HOST at build time: `VITE_REVERB_HOST=<real IP> npm run build`.

## Environment Variables

See [[deploy-ecosystem-config-js]] for the full list (POS_DB_PASSWORD, POS_REVERB_APP_ID/KEY/SECRET, POS_PHP_DIR).

For actual restaurant deployment (not dev), generate real secrets instead of using placeholders:
- `POS_REVERB_APP_ID` — unique alphanumeric identifier
- `POS_REVERB_APP_KEY` — base64-encoded 32-byte key
- `POS_REVERB_APP_SECRET` — base64-encoded 32-byte secret
- `POS_DB_PASSWORD` — secure MySQL password
