"use client";

import { ReactLenis } from "lenis/react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const pointerFine = useSyncExternalStore(
    subscribeNever,
    getPointerFineSnapshot,
    getServerPointerFineSnapshot,
  );

  // Lenis's JS-driven wheel smoothing and the browser's native CSS
  // scroll-snap (homepage sections) actively fight each other -- observed
  // live as a small scroll input snapping backward to the previous section
  // instead of moving forward at all. Rather than hand-roll Lenis's own
  // `lenis/snap` coordination layer, the homepage relies on native
  // scroll-snap alone (which already has its own smooth/momentum feel) and
  // Lenis stays reserved for routes without snap sections (the blog).
  const hasSnapSections = pathname === "/";

  if (!pointerFine || reducedMotion || hasSnapSections) return null;

  // Keyed on `pathname`: without this, navigating client-side between two
  // non-snap routes (e.g. a blog post back to /blog) keeps the same Lenis
  // instance mounted across the route change, and Lenis caches the
  // scrollable content height at init time -- it doesn't re-measure just
  // because the DOM underneath it got shorter (or taller) after a client-
  // side navigation. Reported live: after returning from a long blog post
  // to the much shorter /blog index, the page stopped scrolling entirely,
  // because Lenis was still intercepting scroll input against the old,
  // taller measurement. Forcing a remount on every pathname change gives
  // Lenis a fresh `resize()`-equivalent measurement of the new page.
  return <ReactLenis key={pathname} root options={{ lerp: 0.1, duration: 1.2 }} />;
}
