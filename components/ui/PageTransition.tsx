"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { durations, easing, useReducedMotionSafe } from "@/lib/motion";
import { useSoundEnabled } from "@/components/ui/SoundToggle";
import { playWhoosh } from "@/lib/sound";

/**
 * Route transition (section 8: "~600ms" fade/scale between routes). Only
 * one route exists today (`/`) — phase 7 adds `/blog` and `/blog/[slug]`,
 * so this isn't visually exercised by a real navigation yet; the machinery
 * is still correct and will activate once those routes exist.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotionSafe();
  const soundEnabled = useSoundEnabled();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    if (soundEnabled && !reducedMotion) playWhoosh();
  }, [pathname, soundEnabled, reducedMotion]);

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
