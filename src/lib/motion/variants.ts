import type { Variants } from "framer-motion";

/** Container that staggers its children upward on mount. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/** A single child rising into place. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

/** Per-row stream-in delay (seconds), time-boxed so large maps finish ~1.2s. */
export function rowDelay(index: number, total: number, reduced: boolean): number {
  if (reduced || total <= 0) return 0;
  const budget = 1.2;
  return Math.min(index * 0.04, (index / total) * budget);
}
