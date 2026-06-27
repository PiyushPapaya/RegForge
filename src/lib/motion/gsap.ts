"use client";
import type { gsap as GsapType } from "gsap";

let cached: typeof GsapType | null = null;

/** Lazily import GSAP on the client only. Returns null during SSR. */
export async function loadGsap(): Promise<typeof GsapType | null> {
  if (typeof window === "undefined") return null;
  if (cached) return cached;
  const mod = await import("gsap");
  cached = mod.gsap ?? mod.default;
  return cached;
}
