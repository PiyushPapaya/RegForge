export function parseBits(bits: string): { hi: number; lo: number } {
  if (bits.includes(":")) {
    const [hi, lo] = bits.split(":").map((n) => parseInt(n, 10));
    return { hi, lo };
  }
  const n = parseInt(bits, 10);
  return { hi: n, lo: n };
}

export function shiftFor(bits: string): number {
  return parseBits(bits).lo;
}

export function maskFor(bits: string): string {
  const { hi, lo } = parseBits(bits);
  let mask = 0;
  for (let b = lo; b <= hi; b++) mask |= 1 << b;
  const hexDigits = Math.max(2, Math.ceil((hi + 1) / 4));
  return "0x" + mask.toString(16).toUpperCase().padStart(hexDigits, "0");
}
