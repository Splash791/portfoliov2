"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/motion";
import { useSyncExternalStore, type ReactNode } from "react";

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
 * Subtly pulls its child toward the cursor on hover (section 8: "magnetic
 * buttons"). No-op wrapper — same x/y stay at 0, no mousemove listener is
 * ever attached — under reduced motion or on touch devices (no real cursor
 * to be magnetic toward).
 */
export default function Magnetic({
  children,
  strength = 0.25,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const reducedMotion = useReducedMotionSafe();
  const pointerFine = useSyncExternalStore(
    subscribeNever,
    getPointerFineSnapshot,
    getServerPointerFineSnapshot,
  );
  const enabled = pointerFine && !reducedMotion;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 15, stiffness: 200 });
  const springY = useSpring(y, { damping: 15, stiffness: 200 });

  if (!enabled) return <>{children}</>;

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
