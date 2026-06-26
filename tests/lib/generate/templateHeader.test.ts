import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { generateHeader } from "@/lib/generate/templateHeader";
import { RegisterMapSchema } from "@/lib/schema/registerMap";

const fx = (f: string) => path.resolve(__dirname, "../../fixtures", f);

describe("generateHeader", () => {
  it("matches the golden device_regs.h", () => {
    const map = RegisterMapSchema.parse(JSON.parse(readFileSync(fx("bmi270.map.json"), "utf8")));
    const out = generateHeader(map);
    const golden = readFileSync(fx("bmi270.device_regs.h"), "utf8");
    expect(out).toBe(golden);
  });
});
