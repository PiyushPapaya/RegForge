import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { generateDriver } from "@/lib/generate/templateDriver";
import { RegisterMapSchema } from "@/lib/schema/registerMap";

const fx = (f: string) => path.resolve(__dirname, "../../fixtures", f);

describe("generateDriver", () => {
  it("matches golden device.c and device.h", () => {
    const map = RegisterMapSchema.parse(JSON.parse(readFileSync(fx("bmi270.map.json"), "utf8")));
    const out = generateDriver(map);
    expect(out.c).toBe(readFileSync(fx("bmi270.device.c"), "utf8"));
    expect(out.h).toBe(readFileSync(fx("bmi270.device.h"), "utf8"));
  });
});
