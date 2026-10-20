"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useReducedMotionSafe } from "@/lib/motion";

// Capability never changes mid-session, so subscribe is a no-op — same
// pattern as Travel.tsx's WebGL feature detection.
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
 * Desktop-only follower dot/ring (section 4/8). Renders nothing — and
 * attaches no listener at all — on touch devices or under reduced motion,
 * so the native cursor is left alone in both cases.
 */
export default function Cursor() {
  const reducedMotion = useReducedMotionSafe();
  const pointerFine = useSyncExternalStore(
    subscribeNever,
    getPointerFineSnapshot,
    getServerPointerFineSnapshot,
  );
  const enabled = pointerFine && !reducedMotion;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { damping: 30, stiffness: 400, mass: 0.3 });
  const springY = useSpring(y, { damping: 30, stiffness: 400, mass: 0.3 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // No listener attaches when disabled — this is the gate, not a
    // zero-duration animation on an already-attached listener.
    if (!enabled) return;

    function handleMove(event: MouseEvent) {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    }
    function handleOver(event: MouseEvent) {
      const target = event.target as Element | null;
      setHovering(!!target?.closest("a, button"));
    }
    function handleLeaveWindow() {
      setVisible(false);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleOver);
    window.addEventListener("mouseleave", handleLeaveWindow);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      window.removeEventListener("mouseleave", handleLeaveWindow);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border border-ink/60 mix-blend-difference"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        width: hovering ? 36 : 14,
        height: hovering ? 36 : 14,
        opacity: visible ? 1 : 0,
      }}
      transition={{ width: { duration: 0.15 }, height: { duration: 0.15 }, opacity: { duration: 0.15 } }}
    />
  );
}
