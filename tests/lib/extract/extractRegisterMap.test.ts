import { describe, it, expect, vi } from "vitest";
import { extractRegisterMap, type TextCaller } from "@/lib/extract/extractRegisterMap";
import { readFileSync } from "node:fs";
import path from "node:path";

const validJson = readFileSync(path.resolve(__dirname, "../../fixtures/bmi270.map.json"), "utf8");

describe("extractRegisterMap", () => {
  it("returns a parsed map on valid JSON", async () => {
    const call: TextCaller = vi.fn().mockResolvedValue(validJson);
    const res = await extractRegisterMap(Buffer.from("pdf"), call);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.map.device.name).toBe("BMI270");
    expect(call).toHaveBeenCalledTimes(1);
  });
  it("strips markdown fences before parsing", async () => {
    const call: TextCaller = vi.fn().mockResolvedValue("```json\n" + validJson + "\n```");
    const res = await extractRegisterMap(Buffer.from("pdf"), call);
    expect(res.ok).toBe(true);
  });
  it("retries once when first response is invalid, then succeeds", async () => {
    const call: TextCaller = vi.fn().mockResolvedValueOnce("not json").mockResolvedValueOnce(validJson);
    const res = await extractRegisterMap(Buffer.from("pdf"), call);
    expect(res.ok).toBe(true);
    expect(call).toHaveBeenCalledTimes(2);
  });
  it("fails after two invalid responses", async () => {
    const call: TextCaller = vi.fn().mockResolvedValue("still not json");
    const res = await extractRegisterMap(Buffer.from("pdf"), call);
    expect(res.ok).toBe(false);
    expect(call).toHaveBeenCalledTimes(2);
  });
});
