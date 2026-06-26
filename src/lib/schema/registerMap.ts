import { z } from "zod";

const hex = z.string().regex(/^0x[0-9a-fA-F]+$/, "must be a 0x-prefixed hex string");
const bits = z.string().regex(/^(\d+|\d+:\d+)$/, "must be 'N' or 'HI:LO'");
const access = z.enum(["RW", "RO", "WO"]);

export const SourceSchema = z.object({
  page: z.number().int().positive(),
  section: z.string().optional(),
});

export const FieldSchema = z.object({
  name: z.string().min(1),
  bits,
  access,
  reset: z.string(),
  description: z.string().default(""),
  enums: z.array(z.object({ value: hex, name: z.string().min(1) })).optional(),
});

export const RegisterSchema = z.object({
  name: z.string().min(1),
  address: hex,
  access,
  reset_value: hex,
  description: z.string().default(""),
  source: SourceSchema,
  fields: z.array(FieldSchema).default([]),
});

export const DeviceSchema = z.object({
  name: z.string().min(1),
  vendor: z.string().default(""),
  bus: z.enum(["I2C", "SPI"]),
  i2c_addresses: z.array(hex).default([]),
  word_size_bits: z.number().int().positive().default(8),
});

export const RegisterMapSchema = z.object({
  device: DeviceSchema,
  registers: z.array(RegisterSchema).min(1),
  init_hints: z.array(z.string()).default([]),
  device_detected: z.boolean().default(true),
});

export type Source = z.infer<typeof SourceSchema>;
export type Field = z.infer<typeof FieldSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type Device = z.infer<typeof DeviceSchema>;
export type RegisterMap = z.infer<typeof RegisterMapSchema>;
