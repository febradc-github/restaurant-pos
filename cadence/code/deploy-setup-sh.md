---
type: file
tags: [code/root, deployment]
aliases: ["deploy/setup.sh"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[deploy-ecosystem-config-js]]", "[[deploy-readme-md]]", "[[US-9]]", "[[EP-1]]"]
sources: []
---

# deploy/setup.sh

Fresh-install bootstrap script for on-premise deployment. Orchestrates all initialization steps in order: dependency installation, database migration, frontend build, print-agent build, PM2 setup, and process startup.

## Steps

1. `composer install` — backend dependencies
2. `php artisan migrate` — database schema
3. `npm install` && `npm run build` in frontend/ — React SPA build
4. `npm install` && `npm run build` in print-agent/ — TypeScript→JavaScript transpile
5. `npm install -g pm2` — install PM2 globally
6. `pm2 start ecosystem.config.js` — start all 4 processes
7. `pm2 save` — persist state for restart-on-reboot

On Unix/Linux, run `pm2 startup` before `pm2 save` to register the startup hook. On Windows, `pm2-windows-startup install` (run in an admin terminal) registers a Run-key entry for Windows boot.

See [[deploy-readme-md]] for full instructions and environment setup.
