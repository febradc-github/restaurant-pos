---
type: infrastructure
tags: [deployment, code/backend]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-6]]", "[[US-9]]"]
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

## Open question for C-9 (On-Premise Deployment)

On an actual restaurant's on-premise machine, these env vars cannot be OS User-scope variables. C-9 needs to define:
- How are these variables configured during deployment setup?
- Where do they live on the production/on-premise machine?
- How do they persist across restarts?

This is a **blocker decision** for C-9's deployment strategy (see [[US-9]]).
