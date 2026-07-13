# print-agent

A small standalone local service that runs on the restaurant's on-premise
machine. It exposes an HTTP API that the Laravel backend's checkout flow
(ticket C-7) calls to print a receipt and pop the cash drawer on a
network-connected ESC/POS thermal receipt printer.

This is a fully independent Node.js/TypeScript project -- it is not part of
`backend` (Laravel) or `frontend` (React) and has no dependency on either.

## Why this stack

- **TypeScript** to match the rest of the project's JS/TS conventions
  (the frontend is TypeScript).
- **Vitest** as the test runner, matching the frontend's choice, for
  consistency across the repo.
- **Node's built-in `http` and `net` modules only** -- no Express, no
  print/ESC-POS library, no dotenv. This service is small enough that a
  framework would add indirection without adding value, and the hard
  project rule against touching `.env` files means there's no dotenv
  dependency to add anyway; configuration is read straight from
  `process.env` with in-code defaults.

## Running it

```sh
npm install
npm run build   # compiles src/ -> dist/
npm start       # runs dist/index.js
```

For local development (no build step, auto TS execution):

```sh
npm run dev
```

## Configuration

All configuration is read from environment variables at process start --
there is no `.env` file for this service. Set variables however your
process manager (systemd, pm2, Windows service wrapper, etc.) supports.

| Variable                     | Default     | Meaning                                                                 |
| ----------------------------- | ----------- | ------------------------------------------------------------------------ |
| `PRINT_AGENT_PORT`             | `4000`      | Port this service's own HTTP API listens on (what Laravel/C-7 calls). |
| `PRINTER_HOST`                 | `127.0.0.1` | IP/hostname of the physical receipt printer on the local network.       |
| `PRINTER_PORT`                 | `9100`      | Raw ESC/POS TCP port the printer listens on (9100 is the de facto standard for network thermal printers, e.g. Epson TM-T88). |
| `PRINTER_CONNECT_TIMEOUT_MS`   | `5000`      | How long to wait for the TCP connection to the printer before giving up and reporting it unavailable. |

Note: `PRINT_AGENT_PORT` (this service's own HTTP port) is intentionally a
different number from `PRINTER_PORT` (the printer's raw ESC/POS port) to
avoid confusing the two.

## API

### `POST /print`

Formats the given receipt as ESC/POS commands, sends it to the configured
printer, and (unless `openDrawer: false`) appends the cash-drawer-kick
pulse to the same print job so the drawer opens as part of printing the
receipt.

Request body:

```json
{
  "restaurantName": "Cadence Diner",
  "timestamp": "2026-07-13T18:30:00.000Z",
  "items": [
    { "name": "Burger", "qty": 2, "price": 9.5 },
    { "name": "Fries", "qty": 1, "price": 3.25 }
  ],
  "total": 22.25,
  "openDrawer": true
}
```

- `restaurantName` (string, required)
- `items` (non-empty array, required) -- each item needs `name` (string),
  `qty` (positive number), `price` (non-negative number)
- `total` (non-negative number, required)
- `timestamp` (string, optional) -- defaults to the current server time if omitted
- `openDrawer` (boolean, optional) -- defaults to `true`; set to `false` to
  print without kicking the drawer (e.g. a reprint)

Responses:

- `200 { "status": "ok" }` -- printed successfully (and drawer kicked, if requested)
- `400 { "error": "<description>" }` -- the request body is missing a
  required field or has an invalid shape; nothing was sent to the printer
- `502 { "error": "Printer unavailable: <description>" }` -- the printer
  could not be reached or the write failed (disconnected, wrong
  host/port, connection refused, timed out, etc.); nothing printed. A
  Cashier-facing UI should treat this as "go check the printer" rather
  than assume the receipt printed.
- `404 { "error": "Not found" }` -- unknown route or method
- `500 { "error": "Unexpected error: <description>" }` -- safety-net for
  anything not covered above; the process itself does not crash

## Architecture notes

- `src/escpos/commands.ts` -- raw ESC/POS byte constants (init, bold,
  alignment, paper cut, and the cash-drawer-kick pulse `ESC p 0 25 250`).
- `src/escpos/receiptBuilder.ts` -- pure function that turns a receipt
  request into the exact byte sequence to send to the printer. Fully
  unit-tested without any hardware.
- `src/transport/PrinterTransport.ts` -- the `write(bytes): Promise<void>`
  interface everything else depends on.
- `src/transport/TcpPrinterTransport.ts` -- real implementation: opens a
  TCP socket to `PRINTER_HOST:PRINTER_PORT`, writes the bytes, and
  rejects on any connection/timeout/write error.
- `src/transport/FakePrinterTransport.ts` -- in-memory implementation used
  in tests; records what was written and can be configured to simulate a
  disconnected printer.
- `src/server.ts` -- the HTTP layer (`POST /print`), built against the
  `PrinterTransport` interface so it can be tested with the fake
  transport.
- `src/index.ts` -- production entry point; wires a real
  `TcpPrinterTransport` into the HTTP server and starts listening.

## Testing hardware was not available

This was developed and tested on a machine with **no physical thermal
printer or cash drawer attached**. Because the printer connection is
built as a pluggable `PrinterTransport`, the ESC/POS byte-generation logic
and the full HTTP API (success, validation-failure, and
transport-failure paths) are unit-tested against `FakePrinterTransport`
and a local loopback TCP listener -- not against real hardware.

**Hardware transport testing -- an actual TCP connection to a physical
ESC/POS printer/cash drawer, confirming the printer really prints and the
drawer really opens -- was NOT possible in this environment and still
needs on-site verification** with the real printer model the restaurant
uses, once `PRINTER_HOST`/`PRINTER_PORT` are pointed at it.
