import * as net from "node:net";
import type { PrinterTransport } from "./PrinterTransport.js";

export interface TcpPrinterTransportOptions {
  /** Printer IP address / hostname on the local network. */
  host: string;
  /** Raw ESC/POS port the printer listens on -- conventionally 9100. */
  port: number;
  /** How long to wait for the TCP connection before giving up. */
  connectTimeoutMs?: number;
}

const DEFAULT_CONNECT_TIMEOUT_MS = 5000;

/**
 * Real `PrinterTransport` for network (Ethernet/Wi-Fi) thermal printers,
 * the standard way most commercial receipt printers (e.g. Epson TM-T88
 * series) accept raw ESC/POS data: a plain TCP socket on port 9100.
 *
 * Opens a fresh connection per write, sends the bytes, and closes the
 * socket -- receipt printers don't require (and mostly don't support) a
 * persistent session, and a fresh connection per print job keeps failure
 * handling simple: any connection/write error rejects the returned
 * promise so the caller (the HTTP layer) can surface it instead of
 * failing silently.
 */
export class TcpPrinterTransport implements PrinterTransport {
  private readonly host: string;
  private readonly port: number;
  private readonly connectTimeoutMs: number;

  constructor(options: TcpPrinterTransportOptions) {
    this.host = options.host;
    this.port = options.port;
    this.connectTimeoutMs = options.connectTimeoutMs ?? DEFAULT_CONNECT_TIMEOUT_MS;
  }

  write(bytes: Buffer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const socket = new net.Socket();
      let settled = false;

      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        reject(error);
      };

      const succeed = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      socket.setTimeout(this.connectTimeoutMs);

      socket.once("timeout", () => {
        fail(
          new Error(
            `Timed out connecting to printer at ${this.host}:${this.port} after ${this.connectTimeoutMs}ms`,
          ),
        );
      });

      socket.once("error", (err) => {
        fail(
          new Error(
            `Failed to reach printer at ${this.host}:${this.port}: ${err.message}`,
          ),
        );
      });

      socket.connect(this.port, this.host, () => {
        socket.setTimeout(0);
        socket.write(bytes, (err) => {
          if (err) {
            fail(new Error(`Failed to write to printer at ${this.host}:${this.port}: ${err.message}`));
            return;
          }
          socket.end();
        });
      });

      socket.once("close", () => {
        succeed();
      });
    });
  }
}
