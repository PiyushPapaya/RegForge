import { describe, it, expect, vi } from "vitest";
import { buildInitSequence, type InitCaller } from "@/lib/generate/initSequence";
import { RegisterMapSchema } from "@/lib/schema/registerMap";
import { readFileSync } from "node:fs";
import path from "node:path";

const map = RegisterMapSchema.parse(
  JSON.parse(readFileSync(path.resolve(__dirname, "../../fixtures/bmi270.map.json"), "utf8"))
);

describe("buildInitSequence", () => {
  it("returns parsed steps from the model", async () => {
    const call: InitCaller = vi.fn().mockResolvedValue(
      JSON.stringify({ steps: [{ order: 1, action: "Soft reset", detail: "write CMD=0xB6", source: { page: 42 } }] })
    );
    const res = await buildInitSequence(map, call);
    expect(res.degraded).toBe(false);
    expect(res.steps[0].action).toBe("Soft reset");
  });
  it("degrades to init_hints when the model fails", async () => {
    const call: InitCaller = vi.fn().mockRejectedValue(new Error("timeout"));
    const res = await buildInitSequence(map, call);
    expect(res.degraded).toBe(true);
    expect(res.steps[0].action).toContain("Soft reset via CMD=0xB6");
  });
  it("degrades when the model returns junk", async () => {
    const call: InitCaller = vi.fn().mockResolvedValue("not json");
    const res = await buildInitSequence(map, call);
    expect(res.degraded).toBe(true);
  });
});
