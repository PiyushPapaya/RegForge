import { describe, it, expect, vi, afterEach } from "vitest";
import { prefersReducedMotion } from "@/lib/motion/reducedMotion";

afterEach(() => { vi.unstubAllGlobals(); });

describe("prefersReducedMotion", () => {
  it("returns false when matchMedia is unavailable (SSR)", () => {
    vi.stubGlobal("window", undefined);
    expect(prefersReducedMotion()).toBe(false);
  });
  it("reflects the media query match", () => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: true }) });
    expect(prefersReducedMotion()).toBe(true);
    vi.stubGlobal("window", { matchMedia: () => ({ matches: false }) });
    expect(prefersReducedMotion()).toBe(false);
  });
});
