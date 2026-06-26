import { describe, it, expect } from "vitest";
import { RegisterMapSchema } from "@/lib/schema/registerMap";

const valid = {
  device: { name: "BMI270", vendor: "Bosch", bus: "I2C", i2c_addresses: ["0x68"], word_size_bits: 8 },
  registers: [
    {
      name: "PWR_CTRL", address: "0x7D", access: "RW", reset_value: "0x00",
      description: "Enables sensors", source: { page: 42, section: "5.3.16" },
      fields: [
        { name: "acc_en", bits: "2", access: "RW", reset: "0", description: "Accel enable",
          enums: [{ value: "0x1", name: "ENABLED" }] },
      ],
    },
  ],
  init_hints: ["Soft reset via CMD=0xB6"],
};

describe("RegisterMapSchema", () => {
  it("accepts a valid map", () => {
    expect(RegisterMapSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects a missing reset_value", () => {
    const bad = structuredClone(valid);
    delete (bad.registers[0] as Record<string, unknown>).reset_value;
    expect(RegisterMapSchema.safeParse(bad).success).toBe(false);
  });
  it("rejects an address that is not a hex string", () => {
    const bad = structuredClone(valid);
    bad.registers[0].address = "125";
    expect(RegisterMapSchema.safeParse(bad).success).toBe(false);
  });
  it("rejects a bad bit range like '5:'", () => {
    const bad = structuredClone(valid);
    bad.registers[0].fields[0].bits = "5:";
    expect(RegisterMapSchema.safeParse(bad).success).toBe(false);
  });
  it("allows fields without enums", () => {
    const ok = structuredClone(valid);
    delete (ok.registers[0].fields[0] as Record<string, unknown>).enums;
    expect(RegisterMapSchema.safeParse(ok).success).toBe(true);
  });
});
