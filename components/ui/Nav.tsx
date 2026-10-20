"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { durations, easing, useReducedMotionSafe } from "@/lib/motion";
import SoundToggle, { useSoundEnabled } from "@/components/ui/SoundToggle";
import { playTick } from "@/lib/sound";

// Nav is rendered globally (root layout), but these sections only exist on
// `/`. A bare `#about` is a same-page fragment link — from `/blog/[slug]` it
// resolves to nothing on that page at all (Lighthouse flags this as an
// unfocusable skip-link). Prefixing with `/` makes every link work the same
// from any route: same-page smooth-scroll on the homepage, full navigation
// + scroll from everywhere else.
const LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#projects", label: "Projects" },
  { href: "/#travel", label: "Travel" },
  { href: "/#writing", label: "Blog" },
];

export default function Nav() {
  const { scrollY, scrollYProgress } = useScroll();
  const reducedMotion = useReducedMotionSafe();
  const soundEnabled = useSoundEnabled();
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);

  // Sound is gated by both the user's toggle and reduced-motion (section 0,
  // bullet 4: "...cursor effects and sound are disabled" under reduced motion).
  function handleLinkHover() {
    if (soundEnabled && !reducedMotion) playTick();
  }

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? current;
    const delta = current - previous;
    if (current < 80) {
      setHidden(false);
    } else if (delta > 0) {
      setHidden(true);
    } else if (delta < 0) {
      setHidden(false);
    }
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setProgress(value);
  });

  return (
    <motion.header
      role="banner"
      initial={false}
      animate={{ y: hidden ? -96 : 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: durations.base, ease: easing.out }
      }
      className="fixed inset-x-0 top-4 z-50 flex justify-start px-4"
    >
      <nav
        aria-label="Primary"
        className="glass flex max-w-[calc(100vw-2rem)] items-center gap-1 rounded-full px-3 py-2 sm:gap-2"
      >
        <Link
          href="/#top"
          className="shrink-0 px-2 font-serif text-lg leading-none text-ink"
        >
          TQ
        </Link>

        <div className="flex max-w-[44vw] items-center gap-1 overflow-x-auto scrollbar-none sm:max-w-none sm:gap-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={handleLinkHover}
              className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-xs text-ink/70 transition-colors hover:bg-white/40 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-1 flex shrink-0 items-center gap-2 border-l border-glass-border pl-2">
          {/* TODO: no real LinkedIn URL was provided in the plan — replace href before launch. */}
          <a
            href="#"
            data-placeholder="linkedin-url"
            // Accessible name starts with the visible "in" text (WCAG 2.5.3
            // Label in Name), rather than an unrelated "LinkedIn" label.
            aria-label="in, LinkedIn"
            className="shrink-0 font-mono text-xs text-ink/70 transition-colors hover:text-ink"
          >
            in
          </a>
          <SoundToggle />
        </div>
      </nav>

      {/* Section-progress indicator */}
      <div
        aria-hidden
        className="absolute inset-x-6 -bottom-2 h-0.5 overflow-hidden rounded-full bg-ink/10"
      >
        <motion.div
          className="h-full rounded-full bg-coral"
          style={{ width: `${Math.round(progress * 100)}%` }}
          transition={reducedMotion ? { duration: 0 } : { duration: durations.fast }}
        />
      </div>
    </motion.header>
  );
}
