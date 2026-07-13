import * as net from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { TcpPrinterTransport } from "../src/transport/TcpPrinterTransport.js";

describe("TcpPrinterTransport", () => {
  let server: net.Server | undefined;

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()));
      server = undefined;
    }
  });

  it("writes bytes to a listening TCP socket", async () => {
    const received: Buffer[] = [];
    server = net.createServer((socket) => {
      socket.on("data", (chunk) => received.push(chunk));
    });
    await new Promise<void>((resolve) => server!.listen(0, "127.0.0.1", resolve));
    const port = (server.address() as net.AddressInfo).port;

    const transport = new TcpPrinterTransport({ host: "127.0.0.1", port });
    await transport.write(Buffer.from([0x1b, 0x40, 0x48, 0x49]));

    // give the server a tick to receive the data
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(Buffer.concat(received)).toEqual(Buffer.from([0x1b, 0x40, 0x48, 0x49]));
  });

  it("rejects when no printer is listening on the configured host/port", async () => {
    // Port 1 is a privileged port that nothing in this test suite binds to,
    // so the connection is refused -- simulating a disconnected/unavailable printer.
    const transport = new TcpPrinterTransport({
      host: "127.0.0.1",
      port: 1,
      connectTimeoutMs: 500,
    });

    await expect(transport.write(Buffer.from("hello"))).rejects.toThrow();
  });

  it("rejects if the connection cannot be established within connectTimeoutMs", async () => {
    // 10.255.255.1 is a non-routable address commonly used to force a connection
    // timeout in tests (no RST, no SYN-ACK). In sandboxed/offline environments the
    // OS may instead report the network as unreachable immediately -- either way
    // this must reject rather than hang or resolve.
    const transport = new TcpPrinterTransport({
      host: "10.255.255.1",
      port: 9100,
      connectTimeoutMs: 200,
    });

    await expect(transport.write(Buffer.from("hello"))).rejects.toThrow();
  }, 2000);
});
