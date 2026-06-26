import { describe, it, expect } from "vitest";
import { parseBits, maskFor, shiftFor } from "@/lib/generate/hex";

describe("hex helpers", () => {
  it("parses a single bit", () => { expect(parseBits("2")).toEqual({ hi: 2, lo: 2 }); });
  it("parses a range", () => { expect(parseBits("5:3")).toEqual({ hi: 5, lo: 3 }); });
  it("computes shift = lo", () => { expect(shiftFor("5:3")).toBe(3); });
  it("computes a 3-bit mask for 5:3", () => { expect(maskFor("5:3")).toBe("0x38"); });
  it("computes a 1-bit mask for 2", () => { expect(maskFor("2")).toBe("0x04"); });
});
