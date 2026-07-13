---
type: file
tags: [code/backend]
aliases: ["config/broadcasting.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[reverb-env-config-no-dotenv]]"]
sources: []
---

# config/broadcasting.php

Laravel broadcasting configuration, manually created from vendor stub (C-6).

## Design

Manually recreated (not via interactive `install:broadcasting` command) to avoid `.env` modification. Reads all Reverb settings from OS-level environment variables:
- `BROADCAST_CONNECTION` (default: 'reverb')
- `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`
- `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME`

See [[reverb-env-config-no-dotenv]] for deployment implications.
