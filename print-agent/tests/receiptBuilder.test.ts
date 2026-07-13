import { describe, expect, it } from "vitest";
import { buildReceiptBytes } from "../src/escpos/receiptBuilder.js";
import { CUT, DRAWER_KICK, INIT } from "../src/escpos/commands.js";
import type { ReceiptRequest } from "../src/types.js";

const sampleReceipt: ReceiptRequest = {
  restaurantName: "Cadence Diner",
  timestamp: "2026-07-13T18:30:00.000Z",
  items: [
    { name: "Burger", qty: 2, price: 9.5 },
    { name: "Fries", qty: 1, price: 3.25 },
  ],
  total: 22.25,
};

describe("buildReceiptBytes", () => {
  it("starts with the ESC/POS initialize sequence", () => {
    const bytes = buildReceiptBytes(sampleReceipt);
    expect(bytes.subarray(0, INIT.length)).toEqual(INIT);
  });

  it("includes the restaurant name and each line item's name, qty and price", () => {
    const bytes = buildReceiptBytes(sampleReceipt);
    const text = bytes.toString("latin1");
    expect(text).toContain("Cadence Diner");
    expect(text).toContain("Burger");
    expect(text).toContain("2");
    expect(text).toContain("9.50");
    expect(text).toContain("Fries");
    expect(text).toContain("3.25");
    expect(text).toContain("22.25");
  });

  it("ends with the cut command followed by the cash-drawer-kick sequence by default", () => {
    const bytes = buildReceiptBytes(sampleReceipt);
    const kickStart = bytes.length - DRAWER_KICK.length;
    expect(bytes.subarray(kickStart)).toEqual(DRAWER_KICK);

    const cutStart = kickStart - CUT.length;
    expect(bytes.subarray(cutStart, kickStart)).toEqual(CUT);
  });

  it("omits the drawer-kick sequence when openDrawer is explicitly false", () => {
    const bytes = buildReceiptBytes({ ...sampleReceipt, openDrawer: false });
    const text = bytes.toString("latin1");
    expect(text).not.toContain(DRAWER_KICK.toString("latin1"));
    // still cuts the paper
    const cutStart = bytes.length - CUT.length;
    expect(bytes.subarray(cutStart)).toEqual(CUT);
  });

  it("produces byte-for-byte identical output for the same input (deterministic)", () => {
    const a = buildReceiptBytes(sampleReceipt);
    const b = buildReceiptBytes(sampleReceipt);
    expect(a.equals(b)).toBe(true);
  });
});

describe("DRAWER_KICK constant", () => {
  it("matches the standard ESC/POS pulse-generator drawer-kick sequence (ESC p 0 25 250)", () => {
    // ESC p m t1 t2 -> 0x1B 0x70 0x00 0x19 0xFA
    expect(DRAWER_KICK).toEqual(Buffer.from([0x1b, 0x70, 0x00, 0x19, 0xfa]));
  });
});
