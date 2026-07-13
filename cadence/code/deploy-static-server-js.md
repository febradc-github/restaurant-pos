---
type: file
tags: [code/root, deployment]
aliases: ["deploy/static-server.js"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[deploy-ecosystem-config-js]]", "[[US-9]]", "[[EP-1]]"]
sources: []
---

# deploy/static-server.js

Zero-dependency Node.js static file server for the built React SPA. Binds to 0.0.0.0 (listens on all interfaces) for LAN access.

## Purpose

Serves frontend/dist/ as the final build artifact. Runs as a separate process (managed by PM2, see [[deploy-ecosystem-config-js]]) on port 3000 (configurable via PORT env var). Allows the SPA to be served on the same local machine as the backend without needing a separate web server (nginx, Apache).

## Exports

- Starts HTTP server on port (PORT env var, default 3000), serves frontend/dist/ directory with CORS headers, 404 falls back to index.html (SPA routing).
