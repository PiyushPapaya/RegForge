import { describe, it, expect } from "vitest";
import { buildExtractionPrompt } from "@/lib/extract/prompt";

describe("buildExtractionPrompt", () => {
  it("instructs JSON-only output and includes the schema keys", () => {
    const p = buildExtractionPrompt();
    expect(p).toMatch(/JSON/);
    expect(p).toMatch(/registers/);
    expect(p).toMatch(/source/);
    expect(p).toMatch(/device_detected/);
    expect(p).toMatch(/init_hints/);
  });
});
