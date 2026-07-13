---
type: file
tags: [code/frontend]
aliases: ["src/vite-env.d.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-realtime-echo-ts]]"]
sources: []
---

# src/vite-env.d.ts

Vite environment type definitions, modified in C-6 to include Reverb env vars.

## Change in C-6

Added optional VITE_REVERB_APP_KEY?: string to ImportMetaEnv interface. Also supports VITE_REVERB_HOST/PORT/SCHEME if needed in future.
