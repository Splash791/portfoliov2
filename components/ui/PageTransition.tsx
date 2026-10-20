"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { durations, easing, useReducedMotionSafe } from "@/lib/motion";

/**
 * Route transition (section 8: "~600ms" fade/scale between routes).
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotionSafe();

  // Plain children under reduced motion — no AnimatePresence/exit animation
  // at all, not just a zero-duration transition.
  if (reducedMotion) return <>{children}</>;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }}
        transition={{ duration: durations.slow, ease: easing.out }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
