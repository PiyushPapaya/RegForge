import { describe, it, expect } from "vitest";
import { STAGES, stageState } from "@/lib/stages";

describe("stages", () => {
  it("has the four stages in order", () => {
    expect(STAGES).toEqual(["upload", "extract", "verify", "generate"]);
  });
  it("marks past=done, current=active, future=pending", () => {
    expect(stageState("verify", "upload")).toBe("done");
    expect(stageState("verify", "verify")).toBe("active");
    expect(stageState("verify", "generate")).toBe("pending");
  });
});
