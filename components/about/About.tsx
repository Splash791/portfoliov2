"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { durations, easing, useReducedMotionSafe } from "@/lib/motion";

// TODO(section 12): bio copy is an open item — write a first-person draft
// together, or swap in the user's own. Voice is locked: curious builder +
// avid traveler. Keep this generic in content, specific in tone only.
const LEAD =
  "I like taking things apart until I understand how they work, then building my own version and shipping it. Outside of code, that same curiosity sends me chasing new cities, trains, and trail maps — travel's less a break from building and more another way to do it.";

// TODO(section 12): more detail, same open-bio-copy caveat as LEAD.
const DETAIL =
  "Most of what I build starts as a question I couldn't answer quickly — how a routing model picks an expert, how a map renders a route, how a shell parses a pipe. I'd rather read the source and rebuild a small version than take it on faith. That habit carries over to travel: I plan trips the way I plan projects, with a rough route and a lot of room to go off it.";

const QUICK_FACTS = [
  { label: "School", value: "CS @ Oregon State University" },
  { label: "Targeting", value: "MLE / SWE roles" },
  // TODO: no specific city/region was given in the plan — replace or remove.
  { label: "Based in", value: "Location TBD", placeholder: true },
];

function LeadReveal({ text, reducedMotion }: { text: string; reducedMotion: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.25"],
  });

  const words = text.split(" ");

  if (reducedMotion) {
    // Reduced motion: a single fade-in, no per-word scroll staggering at all.
    return (
      <p
        ref={ref}
        data-placeholder="about-lead"
        className="font-serif text-2xl leading-snug text-ink sm:text-3xl lg:text-4xl"
      >
        {text}
      </p>
    );
  }

  return (
    <p
      ref={ref}
      data-placeholder="about-lead"
      className="font-serif text-2xl leading-snug text-ink sm:text-3xl lg:text-4xl"
    >
      {words.map((word, i) => {
        const start = i / words.length;
        const end = Math.min(start + 1 / words.length, 1);
        return (
          <Word key={i} word={word} progress={scrollYProgress} start={start} end={end} />
        );
      })}
    </p>
  );
}

function Word({
  word,
  progress,
  start,
  end,
}: {
  word: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
}) {
  // Lower bound is 0.55, not a near-invisible value: at rest (e.g. before
  // the section scrolls into view, which is exactly what a static
  // contrast checker sees on initial page load) this still needs to clear
  // ~3:1 against the base background for this large (2xl+) text — a purely
  // decorative near-zero starting opacity would read as a real contrast
  // failure, not just a transient animation frame.
  const opacity = useTransform(progress, [start, end], [0.55, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.3em] inline-block">
      {word}
    </motion.span>
  );
}

export default function About() {
  const reducedMotion = useReducedMotionSafe();
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="about" className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:py-32">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="flex flex-col gap-6">
          <h2 className="font-mono text-xs uppercase tracking-wide text-ink/70">About</h2>

          <LeadReveal text={LEAD} reducedMotion={reducedMotion} />

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="glass w-fit rounded-full px-4 py-2 font-mono text-xs text-ink transition-colors hover:bg-white/40"
          >
            {expanded ? "Show less" : "More about how I work"}
          </button>

          <motion.div
            initial={false}
            animate={{
              height: expanded ? "auto" : 0,
              opacity: expanded ? 1 : 0,
            }}
            transition={
              reducedMotion ? { duration: 0 } : { duration: durations.base, ease: easing.out }
            }
            className="overflow-hidden"
          >
            <p
              data-placeholder="about-detail"
              className="max-w-xl pt-2 text-base leading-relaxed text-ink/80"
            >
              {DETAIL}
            </p>
          </motion.div>

          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {QUICK_FACTS.map((fact) => (
              <div key={fact.label} className="glass rounded-2xl px-4 py-3">
                <dt className="font-mono text-[0.65rem] uppercase tracking-wide text-ink/70">
                  {fact.label}
                </dt>
                <dd
                  data-placeholder={fact.placeholder ? "quick-fact" : undefined}
                  className="mt-1 text-sm text-ink"
                >
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
          {/* TODO: no professional headshot available yet (section 11). */}
          {/* `.glass`'s `border` shorthand would otherwise override a
              `border-dashed` utility at equal specificity — set the dashed
              style inline so it actually wins the cascade. */}
          <div
            data-placeholder="headshot"
            style={{ borderStyle: "dashed" }}
            className="glass flex aspect-square flex-1 flex-col items-center justify-center gap-2 rounded-[2rem]"
          >
            <span className="font-serif text-4xl text-ink/75">TQ</span>
            <span className="font-mono text-[0.65rem] text-ink/65">Headshot placeholder</span>
          </div>
          {/* TODO: no casual/personal photo available yet (section 11). */}
          <div
            data-placeholder="casual-photo"
            style={{ borderStyle: "dashed" }}
            className="glass flex aspect-[4/3] flex-1 flex-col items-center justify-center gap-2 rounded-[2rem] sm:aspect-square"
          >
            <span className="font-mono text-[0.65rem] text-ink/65">Casual photo placeholder</span>
          </div>
        </div>
      </div>
    </section>
  );
}
