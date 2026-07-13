import { createServer } from "./server.js";
import { TcpPrinterTransport } from "./transport/TcpPrinterTransport.js";

// This service is deliberately config-free (no .env file, no config
// framework) -- it reads everything from process.env directly with
// sensible in-code defaults, per project convention.

/** Port this agent's own HTTP API listens on (what Laravel/C-7 calls). */
const HTTP_PORT = Number(process.env.PRINT_AGENT_PORT ?? 4000);

/** Host/IP of the physical receipt printer on the local network. */
const PRINTER_HOST = process.env.PRINTER_HOST ?? "127.0.0.1";

/** Raw ESC/POS port the printer listens on -- 9100 is the conventional default. */
const PRINTER_PORT = Number(process.env.PRINTER_PORT ?? 9100);

const CONNECT_TIMEOUT_MS = Number(process.env.PRINTER_CONNECT_TIMEOUT_MS ?? 5000);

const transport = new TcpPrinterTransport({
  host: PRINTER_HOST,
  port: PRINTER_PORT,
  connectTimeoutMs: CONNECT_TIMEOUT_MS,
});

const server = createServer(transport);

server.listen(HTTP_PORT, () => {
  console.log(`print-agent listening on http://127.0.0.1:${HTTP_PORT}`);
  console.log(`configured printer target: ${PRINTER_HOST}:${PRINTER_PORT}`);
});
