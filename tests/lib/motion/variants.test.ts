import { describe, it, expect } from "vitest";
import { rowDelay } from "@/lib/motion/variants";

describe("rowDelay", () => {
  it("returns 0 for the first row", () => {
    expect(rowDelay(0, 30, false)).toBe(0);
  });
  it("is time-boxed: last row <= 1.2s for large maps", () => {
    expect(rowDelay(199, 200, false)).toBeLessThanOrEqual(1.2);
  });
  it("returns 0 for every row when reduced motion", () => {
    expect(rowDelay(10, 30, true)).toBe(0);
  });
});
