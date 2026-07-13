// PM2 process-supervisor config for the on-premise deployment (ticket C-9).
//
// Resolves the blocker recorded in cadence/brain/reverb-env-config-no-dotenv.md:
// DB and Reverb config were set as Windows User-scope environment variables
// during development, which (a) doesn't survive an unattended reboot
// reliably and (b) isn't visible to a process started under a different
// account/service context. This file is PM2's own native mechanism for
// defining per-process environment variables -- it is a plain JS config
// file, NOT a .env file, and is never touched by the project's .env guard.
// Each app below gets its required env vars explicitly, right next to the
// command that needs them.
//
// Usage: see deploy/README.md. Short version:
//   pm2 start deploy/ecosystem.config.js
//   pm2 save
//   pm2 startup   (one-time, registers PM2 to launch on machine boot)
//
// PostgreSQL is NOT listed here -- on this machine it runs as the Windows
// service `postgresql-x64-17`, which Windows' own Service Control Manager
// already restarts on boot. PM2 only supervises the 4 application
// processes described in the C-9 spec (Laravel API, Reverb, print agent,
// SPA static server).

const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const BACKEND_DIR = path.join(ROOT, "backend");
const PRINT_AGENT_DIR = path.join(ROOT, "print-agent");

// PHP install directory to prepend to PATH for the backend/reverb
// processes. There is no committed default here on purpose: hardcoding a
// path like a WinGet per-user install directory would bake one developer's
// Windows username into this file and silently stop working -- or worse,
// silently pick up the wrong PHP -- on every other machine. Instead:
//   - Set the POS_PHP_DIR environment variable to PHP's install directory
//     (e.g. after `winget install PHP.PHP.8.3`, the path under
//     %LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.3_...), OR
//   - Make sure `php` already resolves on the PATH available to whatever
//     account/process starts PM2 (confirmed while building this file:
//     installing PHP via winget adds it to the User-scope PATH registry
//     value, but that change does not propagate to process trees/services
//     started before the next interactive login -- open a fresh terminal
//     and confirm with `php -v` before relying on this).
// If neither is true, this file fails loudly at load time below instead of
// silently prepending a path that doesn't exist on the current machine.
function resolvePhpDir() {
  if (process.env.POS_PHP_DIR) {
    return process.env.POS_PHP_DIR;
  }
  const probe = spawnSync(process.platform === "win32" ? "where" : "which", ["php"], {
    encoding: "utf8",
  });
  if (probe.status === 0 && probe.stdout.trim()) {
    return ""; // `php` already resolves on PATH; nothing to prepend.
  }
  throw new Error(
    "ecosystem.config.js: `php` was not found on PATH and POS_PHP_DIR is not set. " +
      "Set POS_PHP_DIR to PHP's install directory, or add `php` to the PATH " +
      "available to the account/process that runs `pm2 start`. See deploy/README.md."
  );
}

const PHP_DIR = resolvePhpDir();

const PATH_WITH_PHP = [PHP_DIR, process.env.PATH].filter(Boolean).join(path.delimiter);

// --- Shared DB + Reverb env for the two Laravel-backed processes --------
//
// No secret values are hardcoded in this committed file -- each is read
// from a POS_*-prefixed OS-level environment variable, the same mechanism
// this project already uses for DB/Reverb config (see
// cadence/brain/reverb-env-config-no-dotenv.md), falling back to an
// obviously-fake placeholder if unset so a missing variable fails loudly
// (auth/connection errors) instead of quietly "working" with a value
// nobody chose. Before running `pm2 start deploy/ecosystem.config.js`, set
// POS_DB_PASSWORD, POS_REVERB_APP_ID, POS_REVERB_APP_KEY, and
// POS_REVERB_APP_SECRET -- see deploy/README.md for how. For an actual
// restaurant deployment, generate fresh values for all four -- do not
// reuse another site's or this dev machine's values. Generate
// REVERB_APP_ID/KEY/SECRET as random hex strings (e.g.
// `php -r "echo bin2hex(random_bytes(16));"`) and set a real password for
// the `pos_app` Postgres role.
const LARAVEL_ENV = {
  DB_CONNECTION: "pgsql",
  DB_HOST: "127.0.0.1",
  DB_PORT: "5432",
  DB_DATABASE: "pos_dev",
  DB_USERNAME: "pos_app",
  DB_PASSWORD: process.env.POS_DB_PASSWORD || "CHANGE_ME_DB_PASSWORD",
  BROADCAST_CONNECTION: "reverb",
  REVERB_APP_ID: process.env.POS_REVERB_APP_ID || "CHANGE_ME_REVERB_APP_ID",
  REVERB_APP_KEY: process.env.POS_REVERB_APP_KEY || "CHANGE_ME_REVERB_APP_KEY",
  REVERB_APP_SECRET: process.env.POS_REVERB_APP_SECRET || "CHANGE_ME_REVERB_APP_SECRET",
  // REVERB_HOST here is the target the Laravel backend process itself
  // connects to when *publishing* a broadcast event to Reverb's HTTP API
  // (config/broadcasting.php -> connections.reverb.options.host). Backend
  // and Reverb run on the same machine, so loopback is correct and does
  // NOT need to be the LAN IP -- do not confuse this with VITE_REVERB_HOST
  // below, which browsers on other devices use. See deploy/README.md.
  REVERB_HOST: "127.0.0.1",
  REVERB_PORT: "8080",
  REVERB_SCHEME: "http",
};

module.exports = {
  apps: [
    {
      // Laravel API. `artisan serve` defaults to binding 127.0.0.1 only --
      // --host=0.0.0.0 is required so devices elsewhere on the LAN can
      // reach it (criterion: "devices on the restaurant's local network
      // can reach the system via browser").
      name: "pos-backend",
      cwd: BACKEND_DIR,
      script: "php",
      args: "artisan serve --host=0.0.0.0 --port=8000",
      interpreter: "none",
      env: { ...LARAVEL_ENV, PATH: PATH_WITH_PHP },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
    },
    {
      // Laravel Reverb (WebSocket broadcasting server). config/reverb.php
      // already defaults servers.reverb.host to 0.0.0.0, but --host/--port
      // are passed explicitly so the bind address doesn't depend on that
      // default silently staying correct.
      name: "pos-reverb",
      cwd: BACKEND_DIR,
      script: "php",
      args: "artisan reverb:start --host=0.0.0.0 --port=8080",
      interpreter: "none",
      env: { ...LARAVEL_ENV, PATH: PATH_WITH_PHP },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
    },
    {
      // print-agent. Built via `npm run build` (see setup.sh); PM2 runs the
      // compiled output directly rather than `npm start` so there's one
      // less layer between PM2 and the actual Node process.
      name: "pos-print-agent",
      cwd: PRINT_AGENT_DIR,
      script: path.join(PRINT_AGENT_DIR, "dist", "index.js"),
      env: {
        // print-agent binds 0.0.0.0 implicitly (http.Server.listen(port)
        // with no host binds all interfaces) -- see src/index.ts.
        PRINT_AGENT_PORT: "4000",
        PRINTER_HOST: "127.0.0.1", // REPLACE with the real receipt printer's LAN IP.
        PRINTER_PORT: "9100",
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
    },
    {
      // React SPA, pre-built to frontend/dist and served as static files by
      // deploy/static-server.js (see that file for why this isn't a
      // separate npm dependency). Binds 0.0.0.0 by default.
      name: "pos-frontend",
      cwd: ROOT,
      script: path.join(__dirname, "static-server.js"),
      env: {
        STATIC_ROOT: path.join(ROOT, "frontend", "dist"),
        FRONTEND_PORT: "4173",
        FRONTEND_HOST: "0.0.0.0",
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
    },
  ],
};
