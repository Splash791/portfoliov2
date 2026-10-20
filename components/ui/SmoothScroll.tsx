"use client";

import { ReactLenis } from "lenis/react";
import { useSyncExternalStore } from "react";
import { useReducedMotionSafe } from "@/lib/motion";

// Capability never changes mid-session, so subscribe is a no-op — same
// pattern as Cursor.tsx / Travel.tsx's feature detection.
function subscribeNever() {
  return () => {};
}
function getPointerFineSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}
function getServerPointerFineSnapshot(): boolean {
  return false;
}

/**
 * Lenis smooth scroll — desktop only (section 2): touch devices keep native
 * scroll for feel and performance, and it's fully disabled under reduced
 * motion. When disabled this renders nothing, so native scroll behavior is
 * untouched rather than merely configured to feel "native".
 */
export default function SmoothScroll() {
  const reducedMotion = useReducedMotionSafe();
  const pointerFine = useSyncExternalStore(
    subscribeNever,
    getPointerFineSnapshot,
    getServerPointerFineSnapshot,
  );

  if (!pointerFine || reducedMotion) return null;

  return <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }} />;
}
