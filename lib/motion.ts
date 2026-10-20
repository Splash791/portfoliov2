"use client";

// Shared motion config (section 8). Import these instead of inlining
// easing/duration values so the whole site moves on one rhythm.

import { useSyncExternalStore } from "react";

export const durations = {
  fast: 0.2,
  base: 0.35,
  slow: 0.6, // page transitions stay under this (section 8: "~600ms")
};

export const easing = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotionSnapshot(): boolean {
  return false;
}

/**
 * Hydration-safe replacement for framer-motion's `useReducedMotion()`.
 *
 * The raw hook can read `matchMedia` synchronously on the client's very
 * first render, while SSR has no `window` and always assumes non-reduced —
 * so any visitor with OS-level reduced-motion actually on gets a React
 * hydration-mismatch crash on load whenever a component branches its JSX
 * structure (not just a prop) on the raw hook's value. `useSyncExternalStore`
 * is React's built-in answer to exactly this: it renders `getServerSnapshot`
 * (`false`) on the first client pass to match SSR, then corrects to the real
 * client value afterward — no manual mounted-flag/effect/setState needed,
 * and (unlike a one-time mount check) it also reacts live if the OS setting
 * changes mid-session. Same pattern as Cursor.tsx's pointer-type detection.
 */
export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
}
