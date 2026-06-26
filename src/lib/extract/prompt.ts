export function buildExtractionPrompt(): string {
  return `You are a firmware engineer extracting a register map from a sensor/peripheral datasheet.

Return ONLY a single JSON object, no prose, no markdown fences. The object MUST match:
{
  "device": { "name": string, "vendor": string, "bus": "I2C"|"SPI",
              "i2c_addresses": string[] (0x hex), "word_size_bits": number },
  "registers": [ { "name": string, "address": "0x.." hex, "access": "RW"|"RO"|"WO",
                   "reset_value": "0x.." hex, "description": string,
                   "source": { "page": number, "section": string },
                   "fields": [ { "name": string, "bits": "N" or "HI:LO",
                                 "access": "RW"|"RO"|"WO", "reset": string,
                                 "description": string,
                                 "enums"?: [ { "value": "0x.." hex, "name": string } ] } ] } ],
  "init_hints": string[],
  "device_detected": boolean
}

Rules:
- All addresses, reset values, and enum values MUST be 0x-prefixed hex strings.
- Every register's "source.page" is the 1-based PDF page where you found it.
- "init_hints": short notes on any required power-on/reset/config steps you noticed (e.g. soft-reset commands, mandatory sequences). These ground a later init-sequence step.
- If this PDF is NOT a single-chip I2C/SPI sensor/peripheral datasheet (e.g. an MCU reference manual or unrelated document), set "device_detected": false and "registers": [].
- Extract every register you can find. Do not invent registers or addresses.`;
}
