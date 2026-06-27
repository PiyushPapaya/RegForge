// src/components/Cockpit.tsx
"use client";
import { motion } from "framer-motion";

export function Cockpit({ source, work }: { source: React.ReactNode; work: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-6 py-4 lg:grid-cols-2"
    >
      <section className="min-w-0">{source}</section>
      <section className="min-w-0">{work}</section>
    </motion.div>
  );
}
