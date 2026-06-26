import { describe, it, expect } from "vitest";
import { sanitizeComment, sanitizeIdent } from "@/lib/generate/sanitize";

describe("sanitizeComment", () => {
  it("neutralizes comment-close sequences", () => {
    expect(sanitizeComment("evil */ #include <x>")).not.toContain("*/");
  });
  it("collapses newlines", () => {
    expect(sanitizeComment("line1\nline2")).toBe("line1 line2");
  });
});

describe("sanitizeIdent", () => {
  it("replaces spaces and punctuation with underscore", () => {
    expect(sanitizeIdent("PWR CTRL-1")).toBe("PWR_CTRL_1");
  });
});
