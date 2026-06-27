export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}
/** Per-row delay (ms), time-boxed so large maps finish ~1.2s total. */
export function rowDelay(index: number, total: number): number {
  if (prefersReducedMotion()) return 0;
  const budget = 1200;
  return Math.min(index * 40, total > 0 ? (index / total) * budget : 0);
}
