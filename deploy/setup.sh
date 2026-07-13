#!/usr/bin/env bash
# On-premise deployment setup for the Restaurant POS System (ticket C-9).
#
# Installs dependencies, builds the frontend and print-agent, installs PM2,
# and starts the full stack (Laravel API, Reverb, print agent, SPA static
# server) via deploy/ecosystem.config.js. Safe to re-run: each step is
# either naturally idempotent (composer/npm install, migrate) or checks
# before acting (PM2 install, `pm2 startup` mechanism).
#
# Run from anywhere; paths are resolved relative to this script's location.
#
# --------------------------------------------------------------------------
# Prerequisites (install these yourself first -- this script does not touch
# system-level tooling; see deploy/README.md for the one-time host setup
# that was done manually for this project):
#   - PHP 8.3+ with the pgsql extension, on PATH as `php`
#   - Composer 2.x, on PATH as `composer`
#   - PostgreSQL 17 (or compatible), running as its own service, with a
#     database and role already created matching the DB_* values in
#     deploy/ecosystem.config.js
#   - Node.js 20+ and npm, on PATH as `node`/`npm`
#
# This script does NOT create the Postgres database/role or touch any .env
# file -- per the project's hard "never touch .env" rule, all runtime
# config lives in deploy/ecosystem.config.js (see that file and
# deploy/README.md).
# --------------------------------------------------------------------------

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
PRINT_AGENT_DIR="$ROOT_DIR/print-agent"

log() { echo ">> $*"; }

for cmd in php composer node npm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: '$cmd' is not on PATH. See the Prerequisites block at the top of this script." >&2
    exit 1
  fi
done

log "1/6 Installing backend Composer dependencies..."
(cd "$BACKEND_DIR" && composer install --no-interaction --prefer-dist)

log "2/6 Running database migrations..."
(cd "$BACKEND_DIR" && php artisan migrate --force)

log "3/6 Building the frontend (React SPA)..."
# Vite env vars (VITE_API_BASE_URL, VITE_REVERB_APP_KEY, VITE_REVERB_HOST,
# VITE_REVERB_PORT, VITE_REVERB_SCHEME) are baked in at BUILD time, not read
# at runtime -- export them before running this script if they differ from
# frontend's built-in dev defaults. See deploy/README.md for what to set
# them to for a real on-premise deployment (the machine's LAN IP, not
# localhost).
(cd "$FRONTEND_DIR" && npm install && npm run build)

log "4/6 Installing and building print-agent..."
(cd "$PRINT_AGENT_DIR" && npm install && npm run build)

log "5/6 Installing PM2 (process supervisor) if not already present..."
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
else
  log "pm2 already installed ($(pm2 -v))."
fi

log "6/6 Starting the full stack via PM2..."
(cd "$ROOT_DIR" && pm2 start "$SCRIPT_DIR/ecosystem.config.js")
pm2 save

cat <<'EOF'

Setup complete. Check status with:
  pm2 list
  pm2 logs

To make PM2 resurrect this process list automatically after a machine
restart, see the "Restart recovery" section of deploy/README.md -- it
requires one extra step (`pm2 startup` on Linux/macOS, or the
pm2-windows-startup package on Windows) that only needs to be run once per
machine, not on every re-run of this script.
EOF
