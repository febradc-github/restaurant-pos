import * as http from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createServer } from "../src/server.js";
import { FakePrinterTransport } from "../src/transport/FakePrinterTransport.js";
import { buildReceiptBytes } from "../src/escpos/receiptBuilder.js";
import type { ReceiptRequest } from "../src/types.js";

const validReceipt: ReceiptRequest = {
  restaurantName: "Cadence Diner",
  timestamp: "2026-07-13T18:30:00.000Z",
  items: [
    { name: "Burger", qty: 2, price: 9.5 },
    { name: "Fries", qty: 1, price: 3.25 },
  ],
  total: 22.25,
};

function request(
  server: http.Server,
  options: { method: string; path: string; body?: unknown },
): Promise<{ status: number; body: any }> {
  const port = (server.address() as AddressInfo).port;
  const payload = options.body === undefined ? undefined : JSON.stringify(options.body);

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        method: options.method,
        path: options.path,
        headers: payload
          ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
          : undefined,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let body: any = undefined;
          try {
            body = raw ? JSON.parse(raw) : undefined;
          } catch {
            body = raw;
          }
          resolve({ status: res.statusCode ?? 0, body });
        });
      },
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

describe("POST /print", () => {
  let transport: FakePrinterTransport;
  let server: http.Server;

  beforeEach(async () => {
    transport = new FakePrinterTransport();
    server = createServer(transport);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("returns 200 and writes the correct ESC/POS bytes via the transport on success", async () => {
    const res = await request(server, { method: "POST", path: "/print", body: validReceipt });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok" });
    expect(transport.writes).toHaveLength(1);
    expect(transport.writes[0]).toEqual(buildReceiptBytes(validReceipt));
  });

  it("returns a clear 502 error (not 200, not a crash) when the transport fails", async () => {
    transport.failWith = new Error("Failed to reach printer at 127.0.0.1:9100: ECONNREFUSED");

    const res = await request(server, { method: "POST", path: "/print", body: validReceipt });

    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty("error");
    expect(String(res.body.error)).toMatch(/printer/i);
    expect(transport.writes).toHaveLength(0);
  });

  it("returns 400 and never touches the transport when required fields are missing", async () => {
    const { items, ...withoutItems } = validReceipt;

    const res = await request(server, { method: "POST", path: "/print", body: withoutItems });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(transport.writes).toHaveLength(0);
  });

  it("returns 400 for an empty items array", async () => {
    const res = await request(server, {
      method: "POST",
      path: "/print",
      body: { ...validReceipt, items: [] },
    });

    expect(res.status).toBe(400);
    expect(transport.writes).toHaveLength(0);
  });

  it("returns 400 for malformed JSON", async () => {
    const port = (server.address() as AddressInfo).port;
    const res = await new Promise<{ status: number; body: any }>((resolve, reject) => {
      const req = http.request(
        {
          host: "127.0.0.1",
          port,
          method: "POST",
          path: "/print",
          headers: { "Content-Type": "application/json" },
        },
        (r) => {
          const chunks: Buffer[] = [];
          r.on("data", (c) => chunks.push(c));
          r.on("end", () => {
            resolve({
              status: r.statusCode ?? 0,
              body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
            });
          });
        },
      );
      req.on("error", reject);
      req.write("{ this is not valid json");
      req.end();
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(server, { method: "GET", path: "/nope" });
    expect(res.status).toBe(404);
  });

  it("returns 404 for GET /print", async () => {
    const res = await request(server, { method: "GET", path: "/print" });
    expect(res.status).toBe(404);
  });
});
