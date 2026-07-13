import type { PrinterTransport } from "./PrinterTransport.js";

/**
 * In-memory `PrinterTransport` used by tests. Records every buffer it was
 * asked to write, and can be configured to simulate a printer that is
 * disconnected/unreachable by setting `failWith`.
 */
export class FakePrinterTransport implements PrinterTransport {
  readonly writes: Buffer[] = [];
  failWith: Error | null = null;

  async write(bytes: Buffer): Promise<void> {
    if (this.failWith) {
      throw this.failWith;
    }
    this.writes.push(bytes);
  }
}
