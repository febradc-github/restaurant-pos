/**
 * Abstraction over "send these bytes to the printer somewhere".
 *
 * Keeping this as a narrow interface lets the ESC/POS byte-generation and
 * HTTP API layers be fully unit-tested against a fake implementation,
 * without ever needing a real printer attached to the machine running the
 * tests. `TcpPrinterTransport` is the real implementation used in
 * production (see ./TcpPrinterTransport.ts); `FakePrinterTransport` (see
 * ./FakePrinterTransport.ts) is used in tests.
 */
export interface PrinterTransport {
  /**
   * Send raw bytes to the printer. Must reject (never throw synchronously,
   * never resolve on failure) if the printer cannot be reached or the
   * write fails, so callers can surface a clear error instead of a silent
   * success.
   */
  write(bytes: Buffer): Promise<void>;
}
