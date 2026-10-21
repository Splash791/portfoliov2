"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { durations, easing, useReducedMotionSafe } from "@/lib/motion";
import Magnetic from "@/components/ui/Magnetic";

const NAME = "Tyler Quach";
const ROLE = "CS @ Oregon State University";

// Warm sunset + white only -- user feedback was the violet/rose mix read
// as "floral" rather than sunset. Coral/amber/peach are the warm palette's
// own sunset-adjacent tones; white is Tailwind's own (not a custom warm-
// palette token, since the palette has no white/light entry) for a bright
// haze rather than another saturated hue.
const BLOBS = [
  { color: "bg-coral", className: "left-[-10%] top-[-15%] h-[55vmax] w-[55vmax]", duration: 26 },
  { color: "bg-white", className: "right-[-18%] top-[5%] h-[45vmax] w-[45vmax]", duration: 32 },
  { color: "bg-amber", className: "left-[5%] bottom-[-25%] h-[42vmax] w-[42vmax]", duration: 22 },
  { color: "bg-coral", className: "right-[0%] bottom-[-20%] h-[36vmax] w-[36vmax]", duration: 28 },
  { color: "bg-peach", className: "left-[38%] top-[25%] h-[28vmax] w-[28vmax]", duration: 24 },
];

function Blobs({ reducedMotion }: { reducedMotion: boolean }) {
  // Under reduced motion these render as static shapes (no `animate` loop at
  // all) rather than an animated one paused mid-frame — this is the gate,
  // not a duration tweak.
  if (reducedMotion) {
    return (
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        {BLOBS.map((blob, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-50 blur-[90px] ${blob.color} ${blob.className}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full opacity-50 blur-[90px] ${blob.color} ${blob.className}`}
          animate={{
            x: [0, 40, -24, 0],
            y: [0, -32, 20, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const reducedMotion = useReducedMotionSafe();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-3, 3]);

  useEffect(() => {
    // No listener is attached at all under reduced motion — the headline
    // simply never receives pointer-driven values, it isn't just damped.
    if (reducedMotion) return;
    const handleMove = (event: MouseEvent) => {
      mouseX.set(event.clientX / window.innerWidth - 0.5);
      mouseY.set(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [reducedMotion, mouseX, mouseY]);

  const letters = NAME.split("");
  // Shorter, flatter choreography than before: the per-letter stagger and
  // the role/CTA offsets used to chain up to ~1.3s of total delay (0.3s +
  // 11 letters * 0.03s + up to 0.35s), which left a long window where a
  // loaded machine/browser could visibly stall mid-fade (observed live —
  // the role line stuck at low opacity while later-in-the-chain CTAs had
  // already finished). Less total chained delay means less time for
  // real-world scheduling jitter to land mid-transition.
  const letterStagger = 0.018;
  const ctaDelay = reducedMotion ? 0 : 0.25 + letters.length * letterStagger + 0.2;
  const roleDelay = reducedMotion ? 0 : 0.25 + letters.length * letterStagger + 0.05;

  return (
    <section
      id="hero"
      // `min-h-dvh`, not a shorter 90vh: Hero sits inside SnapSection's own
      // `min-h-dvh flex justify-center` wrapper, so a shorter inner section
      // left a gap above/below where the wrapper's extra height showed
      // through as plain paper background instead of the blob gradient --
      // matching this section's height to its wrapper's closes that gap,
      // so the blobs cover the full first viewport edge-to-edge.
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-6 py-16"
    >
      <Blobs reducedMotion={!!reducedMotion} />

      {/* Static fade into the next (plain-paper) section -- not scroll- or
          motion-driven, so it needs no reduced-motion gate. Sits above the
          blobs (-z-10) but below the glass hero card (z-10) so scrolling
          from the now-full-bleed Hero straight into About's flat background
          reads as a soft bridge instead of a hard color cut. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-32 bg-gradient-to-b from-transparent to-paper sm:h-48"
      />

      <motion.div
        // `reducedMotion` is hydration-safe (always `false` on the very
        // first render to match SSR) and can correct to its real value a
        // moment after mount. The headline/role/CTA delays below are
        // computed from that value, so if it corrects while this entrance
        // animation is already mid-flight, Framer receives a changed
        // `transition.delay` on a live animation instead of a fresh one —
        // keying on the resolved value forces a clean remount-and-restart
        // instead of mutating transition props under an in-progress
        // animation (reported: role line visible but stuck near-invisible
        // while CTAs below it had already finished).
        key={reducedMotion ? "reduced" : "motion"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: durations.slow, ease: easing.out }}
        className="glass relative z-10 flex w-full max-w-6xl flex-col items-center gap-10 rounded-[2rem] px-6 py-10 text-center sm:px-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:text-left"
      >
        <div className="flex flex-col items-center gap-6 lg:items-start">
          <h1 className="font-serif text-5xl leading-[0.95] text-ink sm:text-7xl lg:text-8xl">
            <motion.span
              aria-hidden="true"
              style={reducedMotion ? undefined : { rotateX, rotateY, transformPerspective: 600 }}
              className="inline-block"
            >
              {letters.map((char, i) =>
                // A bare " " text node inside an `inline-block` span gets
                // collapsed away by the browser (observed live: "Tyler
                // Quach" rendered as "TylerQuach") -- a non-breaking space
                // renders reliably in the same inline-block treatment.
                reducedMotion ? (
                  <span key={i}>{char === " " ? " " : char}</span>
                ) : (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: durations.base, delay: 0.25 + i * letterStagger, ease: easing.out }}
                    className="inline-block"
                  >
                    {char === " " ? " " : char}
                  </motion.span>
                ),
              )}
            </motion.span>
            <span className="sr-only">{NAME}</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: durations.base, delay: roleDelay, ease: easing.out }}
            className="font-mono text-sm text-ink/70 sm:text-base"
          >
            {ROLE}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: durations.base, delay: ctaDelay, ease: easing.out }}
            className="mt-2 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <Magnetic>
              <a
                href="#projects"
                className="rounded-full bg-ink px-6 py-3 font-mono text-sm text-[var(--color-paper)] transition-transform hover:scale-[1.03]"
              >
                View Projects
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="https://www.linkedin.com/in/tyler-quach-/"
                target="_blank"
                rel="noreferrer"
                className="glass rounded-full px-6 py-3 font-mono text-sm text-ink transition-transform hover:scale-[1.03]"
              >
                Connect on LinkedIn
              </a>
            </Magnetic>
          </motion.div>
        </div>

        {/* TODO: no professional headshot available yet (section 11). */}
        {/* `.glass`'s `border` shorthand would otherwise override a
            `border-dashed` utility at equal specificity — set the dashed
            style inline so it actually wins the cascade (same pattern as
            About.tsx's photo placeholders). */}
        <div
          data-placeholder="headshot"
          style={{ borderStyle: "dashed" }}
          className="glass flex aspect-square w-64 shrink-0 flex-col items-center justify-center gap-3 rounded-[2rem] sm:w-80 lg:w-[26rem]"
        >
          <span className="font-serif text-6xl text-ink/75 lg:text-7xl">TQ</span>
          <span className="font-mono text-xs text-ink/65 lg:text-sm">Headshot placeholder</span>
        </div>
      </motion.div>
    </section>
  );
}
