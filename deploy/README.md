# On-premise deployment (C-9)

Runs the full Restaurant POS stack -- Laravel API, PostgreSQL, Laravel
Reverb (WebSockets), the React SPA, and the print agent -- together on one
local machine at the restaurant, reachable from other devices on the same
local network, with no internet dependency for core operation.

## Contents of this folder

| File | Purpose |
| --- | --- |
| `ecosystem.config.js` | PM2 process-supervisor config: defines the 4 application processes, their working directories, start commands, and environment variables. |
| `static-server.js` | Zero-dependency Node static file server for the built React SPA (`frontend/dist`). |
| `setup.sh` | Fresh-install script: installs deps, migrates the DB, builds the frontend and print-agent, installs PM2, starts everything. |
| `README.md` | This file. |

## Prerequisites (one-time, host-OS-level, not automated here)

- **PHP 8.3+** with the `pgsql` extension, on `PATH` as `php`.
- **Composer 2.x**, on `PATH` as `composer`.
- **PostgreSQL** (17 used in development), installed and running as its own
  Windows service (`postgresql-x64-17` on this machine), with a database
  and application role already created matching the `DB_*` values in
  `ecosystem.config.js`.
- **Node.js 20+** and `npm`, on `PATH`.

These were installed manually on this machine earlier in the project and
are reasonable to document rather than script, per the ticket's scope --
a restaurant's on-premise machine is set up once, by whoever installs the
POS, not repeatedly.

**Windows PATH note (a real gotcha hit while writing this):** installing
PHP via `winget install PHP.PHP.8.3` adds it to the *User-scope* `PATH`
registry value, but that change does not propagate to process trees or
services that were already running, or that start non-interactively (e.g.
a service, or `pm2-windows-startup`'s login hook -- see "Restart recovery"
below). After installing PHP/Composer, open a **fresh terminal** (or
reboot) and confirm with `php -v` / `composer -V` before relying on them.
`ecosystem.config.js` also works around this partially: it prepends a
configurable PHP directory to the `PATH` it hands to the two Laravel-backed
*processes themselves* via their `env` block, so the running Laravel/Reverb
processes don't depend on the ambient shell's PATH being correct -- see
`POS_PHP_DIR` below. There is no committed default for that directory (a
hardcoded per-user WinGet path would only work on the machine that
installed PHP that way), so **either `php` must already resolve on the
PATH available to whatever account/process runs `pm2 start`, or
`POS_PHP_DIR` must be set** -- `ecosystem.config.js` fails loudly at load
time with a clear error if neither is true, rather than silently prepending
a path that doesn't exist on the current machine. Note that this only
covers the config file's own load-time check and the child processes' env
-- it does **not** cover the PM2 daemon's own resolution of the `php`
executable it launches; see the stale-daemon note right below for that
distinction.

**Stale PM2 daemon note:** PM2's background daemon caches its own process
environment at the moment it first spawns. If `pm2 start`/`pm2 -v`/any pm2
command was ever run earlier in a shell that didn't have `php` on `PATH`,
the daemon keeps running with that stale environment indefinitely -- so a
later `pm2 start deploy/ecosystem.config.js` can still fail with `Script
not found: ...\backend\php`, because PM2 resolves `interpreter:"none"`
scripts (`script: "php"`, used for the backend/Reverb processes) against
the daemon's own PATH, not the per-app `env` block.

**`POS_PHP_DIR` alone does not fix this.** In `ecosystem.config.js`,
`POS_PHP_DIR` only feeds `PATH_WITH_PHP` into the `env` block PM2 passes to
the *already-launched* Laravel/Reverb child processes -- it has no effect
on how the daemon itself resolves the literal `php` command when deciding
what executable to launch in the first place. The fix that actually works:
make sure `php` resolves on the **real PATH of the shell you run `pm2
kill`/`pm2 start` from**, *before* running those commands -- open a fresh
terminal after installing PHP (so the Windows PATH change has propagated)
and confirm with `php -v`, or explicitly prepend PHP's directory in that
shell (`$env:PATH = "$phpDir;$env:PATH"` in PowerShell, `export
PATH="$phpDir:$PATH"` in bash). Then run `pm2 kill` followed by `pm2 start
deploy/ecosystem.config.js` -- `pm2 kill` clears the stale daemon so the
new one respawns inheriting that shell's (now-correct) environment.
Setting `POS_PHP_DIR` and re-running `pm2 kill`/`pm2 start` from a shell
that still lacks `php` on its real PATH reproduces the exact same error.

## Environment configuration: `ecosystem.config.js`, not `.env`

This project has a hard rule: never write to `.env`. During development
(ticket C-6), DB and Reverb config were set as Windows **User-scope**
environment variables via PowerShell -- workable for interactive dev, but
not for an unattended deployment: those variables don't reliably survive a
reboot without someone re-running a script by hand, and they aren't visible
to a process started under a different account or service context (see
`cadence/brain/reverb-env-config-no-dotenv.md` for the full history of that
blocker).

`ecosystem.config.js` resolves this. PM2 has its own native mechanism for
defining per-process environment variables -- a plain JS config file, which
is a completely different thing from a dotenv file and is never touched by
this project's `.env` guard. All required env vars for all 4 processes are
defined there, inline, next to the command that needs them:

- **Backend & Reverb** (`LARAVEL_ENV` in `ecosystem.config.js`):
  `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`,
  `DB_PASSWORD`, `BROADCAST_CONNECTION`, `REVERB_APP_ID`, `REVERB_APP_KEY`,
  `REVERB_APP_SECRET`, `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME`.
  Laravel's `env()` reads real process environment variables before
  falling back to `.env` (and Dotenv does not override an already-set
  variable), so PM2-supplied values take effect exactly like the
  User-scope vars did in dev -- just supervised and reproducible instead of
  set by hand.
- **print-agent**: `PRINT_AGENT_PORT`, `PRINTER_HOST`, `PRINTER_PORT`.
- **Frontend**: see "Frontend build-time env vars" below -- these are
  **not** part of `ecosystem.config.js` because Vite bakes them in at
  build time, not runtime.

`ecosystem.config.js` itself contains **no hardcoded secret values**. The
DB password and the three Reverb credentials are read from OS-level
environment variables at the time `pm2 start` runs, the same mechanism
already used for `DB_*`/`REVERB_*` during development (see
`cadence/brain/reverb-env-config-no-dotenv.md`) -- just under a `POS_`
prefix so they're unambiguously this deployment's own variables rather
than colliding with anything else on the machine. **Set these before
running `pm2 start deploy/ecosystem.config.js`:**

| Variable | Used for |
| --- | --- |
| `POS_DB_PASSWORD` | `DB_PASSWORD` for the `pos_app` Postgres role |
| `POS_REVERB_APP_ID` | `REVERB_APP_ID` |
| `POS_REVERB_APP_KEY` | `REVERB_APP_KEY` (also needed as `VITE_REVERB_APP_KEY` at frontend build time -- see below) |
| `POS_REVERB_APP_SECRET` | `REVERB_APP_SECRET` |
| `POS_PHP_DIR` | PHP install directory prepended to `PATH` for the backend/Reverb processes -- only needed if `php` doesn't already resolve on the PATH available to whatever runs `pm2 start` (see the Windows PATH note above) |

Set them as Windows **User-scope environment variables**, the same way
`DB_PASSWORD`/`REVERB_APP_*` were set during development in C-6:

```powershell
[Environment]::SetEnvironmentVariable("POS_DB_PASSWORD", "<value>", "User")
[Environment]::SetEnvironmentVariable("POS_REVERB_APP_ID", "<value>", "User")
[Environment]::SetEnvironmentVariable("POS_REVERB_APP_KEY", "<value>", "User")
[Environment]::SetEnvironmentVariable("POS_REVERB_APP_SECRET", "<value>", "User")
```

then open a **fresh terminal** (User-scope variables set this way are only
picked up by new processes) before running `pm2 start`. If any of the four
secret variables is left unset, `ecosystem.config.js` falls back to an
obviously-fake placeholder (e.g. `CHANGE_ME_DB_PASSWORD`) instead of a
real-looking value, so a missing variable fails loudly (DB auth errors,
Reverb auth errors) instead of quietly appearing to work.

For an actual restaurant deployment, generate fresh values for all
four -- never reuse another site's or a dev machine's values. Generate
new Reverb credentials the same way they were generated for C-6 (e.g.
`php -r "echo bin2hex(random_bytes(16));"` for each of app ID/key/secret)
and set a real `POS_DB_PASSWORD` for the `pos_app` Postgres role.

### Two different "Reverb host" settings -- don't conflate them

- `REVERB_HOST` (in `ecosystem.config.js`, used by the **backend** process)
  is the address the Laravel backend connects to when *publishing* a
  broadcast event to Reverb's HTTP API. Backend and Reverb run on the same
  machine, so this stays `127.0.0.1` -- it never needs to be a LAN IP.
- `VITE_REVERB_HOST` (a **frontend build-time** var, see below) is the
  address a *browser on another device* uses to open the WebSocket
  connection. It must be the deployment machine's actual LAN IP or
  hostname -- `127.0.0.1` from a browser on a different device means "that
  device itself," not this machine.
- The Reverb *server process*'s bind address (`--host=0.0.0.0` passed to
  `artisan reverb:start` in `ecosystem.config.js`) is a third, separate
  thing again: "which network interfaces does the server listen on," not
  "what does anyone call it." It's `0.0.0.0` (all interfaces) so devices on
  the LAN can reach it at all, regardless of what those devices call it.

### Frontend build-time env vars

Vite bakes `VITE_*` env vars into the built JS bundle at **build time** --
setting them after `npm run build` has no effect; the frontend must be
rebuilt whenever they change. Export them before running `setup.sh` (or
`npm run build` in `frontend/` directly):

```sh
export VITE_API_BASE_URL="http://192.168.31.5:8000"
export VITE_REVERB_APP_KEY="<same value as REVERB_APP_KEY above>"
export VITE_REVERB_HOST="192.168.31.5"      # the deployment machine's LAN IP
export VITE_REVERB_PORT="8080"
export VITE_REVERB_SCHEME="http"
```

Replace `192.168.31.5` with the actual LAN IP of the machine the stack runs
on at the restaurant (see "Reaching the system from the LAN" below).

## Setup

### Scripted (fresh install)

```sh
bash deploy/setup.sh
```

This installs Composer deps, runs migrations, builds the frontend
(remember to export the `VITE_*` vars first -- see above), builds
print-agent, installs PM2 if missing, and starts all 4 processes via
`ecosystem.config.js`. Safe to re-run. Set the `POS_*` variables described
above (`POS_DB_PASSWORD`, `POS_REVERB_APP_ID`, `POS_REVERB_APP_KEY`,
`POS_REVERB_APP_SECRET`, and `POS_PHP_DIR` if needed) before running this,
too -- the final `pm2 start` step needs them.

### Manual (equivalent steps)

```sh
# Backend
cd backend
composer install --no-interaction --prefer-dist
php artisan migrate --force

# Frontend (export VITE_* vars first -- see above)
cd ../frontend
npm install
npm run build

# print-agent
cd ../print-agent
npm install
npm run build

# Process supervisor (POS_DB_PASSWORD, POS_REVERB_APP_ID,
# POS_REVERB_APP_KEY, POS_REVERB_APP_SECRET, and POS_PHP_DIR if needed
# must already be set in this shell -- see "Environment configuration" above)
npm install -g pm2
cd ..
pm2 start deploy/ecosystem.config.js
pm2 save
```

## PostgreSQL is not PM2-supervised

PostgreSQL runs as its own Windows service (`postgresql-x64-17`), installed
by the PostgreSQL installer. Windows' own Service Control Manager restarts
it on boot -- that's already handled outside of PM2. PM2 only supervises
the 4 application processes (`pos-backend`, `pos-reverb`,
`pos-print-agent`, `pos-frontend`); adding Postgres to PM2 as well would
just be supervising something the OS already supervises.

## Reaching the system from the restaurant's local network

Find the deployment machine's LAN IP (Windows: `ipconfig`, look for the
IPv4 address of the active adapter -- e.g. `192.168.31.5` for the Wi-Fi
adapter on this dev machine). Every process binds `0.0.0.0` (all network
interfaces), confirmed for each below, so any device on the same LAN/Wi-Fi
can reach them at `http://<that-ip>:<port>`:

| Service | Port | Bind address | Reachable at |
| --- | --- | --- | --- |
| React SPA (what staff actually open in a browser) | 4173 | `0.0.0.0` (`static-server.js` default) | `http://<LAN-IP>:4173` |
| Laravel API | 8000 | `0.0.0.0` (`artisan serve --host=0.0.0.0`) | `http://<LAN-IP>:8000` |
| Laravel Reverb (WebSocket) | 8080 | `0.0.0.0` (`artisan reverb:start --host=0.0.0.0`; also `config/reverb.php`'s default) | `ws://<LAN-IP>:8080` |
| print-agent | 4000 | `0.0.0.0` (Node's `server.listen(port)` with no host binds all interfaces, despite its own startup log printing `127.0.0.1` -- confirmed by curling it over the LAN IP, see verification below) | `http://<LAN-IP>:4000` (called by the backend's checkout flow, not by staff directly) |

Staff on any device on the restaurant's Wi-Fi/LAN open
`http://<LAN-IP>:4173` in a browser. That page was built with
`VITE_API_BASE_URL`/`VITE_REVERB_*` pointing at the same `<LAN-IP>`, so its
API calls and WebSocket connection reach the backend/Reverb correctly
instead of trying `localhost` (which, from another device, means that
device itself).

Nothing in this stack calls out to the internet for core operation --
`artisan serve`, Reverb, print-agent, and the static file server are all
plain local TCP servers, and the built SPA's only network calls are to the
backend/Reverb on the LAN.

## Restart recovery

**PM2-level recovery (verified on this machine, see below):**

```sh
pm2 save        # snapshot the current process list (setup.sh already does this)
pm2 kill        # stops the PM2 daemon and everything it supervises
pm2 resurrect   # restarts the daemon and everything from the last `pm2 save`
```

**Machine-boot recovery:** PM2's own docs describe `pm2 startup` for this,
but that command is Linux/macOS-only (it targets systemd/upstart/launchd)
-- running it on this Windows machine fails with `Init system not found`.
The Windows equivalent, verified working on this machine, is the
`pm2-windows-startup` package:

```sh
npm install -g pm2-windows-startup
pm2-startup install     # registers a HKCU...\Run entry that runs `pm2 resurrect` at login
```

This adds one entry to the current Windows user's login-time Run registry
key (confirmed via `reg query HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
after running it), invisibly running `pm2 resurrect` every time that user
logs in. **Caveat to plan around for a real restaurant deployment:** this
fires at *user login*, not raw machine boot -- the restaurant's POS machine
needs to be configured to auto-login as that Windows user after a power
cycle for this to bring the stack back up unattended. `pm2-startup
uninstall` removes the entry.

This is a new global npm dependency (`pm2-windows-startup`), added because
`pm2 startup` genuinely doesn't work on Windows and this is PM2's own
documented recommendation for that platform -- not a project dependency,
and not something that touches `.env`.

### What was and wasn't verified

Verified on this machine, with raw output captured in the implementation
report:
- All 4 processes starting via `pm2 start deploy/ecosystem.config.js` and
  reaching `online` status with 0 restarts.
- Each service actually responding: `GET /api/tables` (backend), a TCP
  connection succeeding on Reverb's port, `POST /print` (print-agent,
  including its 502 when the configured printer is unreachable -- proving
  the full HTTP -> validation -> ESC/POS -> TCP-transport pipeline runs),
  and `GET /` returning the built `index.html` (frontend), each both via
  `127.0.0.1` and via this machine's LAN IP.
- `pm2 save` -> `pm2 kill` -> `pm2 resurrect`: all 4 processes stopped,
  confirmed unreachable, then came back `online` and reachable again.
- `pm2-startup install` actually registering the Run-key entry (and
  `pm2-startup uninstall` actually removing it again).

**Not verified** (genuinely outside what's testable in this environment):
- A literal OS reboot. `pm2 resurrect` was run manually to simulate what
  the login-time hook does; the hook firing automatically on an actual
  Windows logon after a real restart was not observed end-to-end.
- A real restaurant LAN with multiple physical devices connecting
  concurrently -- verified by curling the machine's own LAN-facing IP from
  the same machine, which confirms the services bind and respond on that
  interface, but is not the same as a second physical device on the Wi-Fi
  actually doing it.
- A real ESC/POS printer -- print-agent's TCP transport was exercised
  against a closed port (127.0.0.1:9100) and correctly reported the
  printer as unreachable; no physical printer was available to confirm a
  successful print.
