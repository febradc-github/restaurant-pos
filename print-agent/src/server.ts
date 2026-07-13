import * as http from "node:http";
import { buildReceiptBytes } from "./escpos/receiptBuilder.js";
import type { PrinterTransport } from "./transport/PrinterTransport.js";
import { InvalidReceiptRequestError, validateReceiptRequest } from "./validateReceiptRequest.js";

const MAX_BODY_BYTES = 1_000_000; // 1MB is generous for a receipt payload

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handlePrint(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  transport: PrinterTransport,
): Promise<void> {
  const raw = await readBody(req);

  let parsed: unknown;
  try {
    parsed = raw.length > 0 ? JSON.parse(raw) : {};
  } catch {
    sendJson(res, 400, { error: "Request body must be valid JSON" });
    return;
  }

  let receipt;
  try {
    receipt = validateReceiptRequest(parsed);
  } catch (err) {
    if (err instanceof InvalidReceiptRequestError) {
      sendJson(res, 400, { error: err.message });
      return;
    }
    throw err;
  }

  const bytes = buildReceiptBytes(receipt);

  try {
    await transport.write(bytes);
  } catch (err) {
    // The printer/cash drawer is unreachable or the write failed -- surface
    // this clearly to the caller (the Cashier-facing UI, via C-7's checkout
    // flow) instead of responding 200 or letting an unhandled rejection
    // crash the process.
    const message = err instanceof Error ? err.message : String(err);
    sendJson(res, 502, { error: `Printer unavailable: ${message}` });
    return;
  }

  sendJson(res, 200, { status: "ok" });
}

/**
 * Builds the print-agent HTTP server. `transport` is injected so tests can
 * pass a `FakePrinterTransport` -- production wiring (see src/index.ts)
 * passes a `TcpPrinterTransport` pointed at the real printer.
 */
export function createServer(transport: PrinterTransport): http.Server {
  return http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/print") {
      handlePrint(req, res, transport).catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        sendJson(res, 500, { error: `Unexpected error: ${message}` });
      });
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  });
}
