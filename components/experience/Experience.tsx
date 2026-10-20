"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { experience, type Experience as ExperienceEntry } from "@/data/experience";
import { durations, easing, useReducedMotionSafe } from "@/lib/motion";

function TimelineLine({ reducedMotion, target }: { reducedMotion: boolean; target: React.RefObject<HTMLDivElement | null> }) {
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start 0.75", "end 0.6"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      aria-hidden
      className="absolute top-0 bottom-0 left-4 w-px -translate-x-1/2 bg-ink/15 sm:left-1/2"
    >
      {/* Reduced motion: line renders at full height statically — no
          scroll-driven scaleY animation at all, not just a fast one. */}
      <motion.div
        className="h-full w-full origin-top bg-ink/60"
        style={reducedMotion ? { scaleY: 1 } : { scaleY }}
      />
    </div>
  );
}

function Dot({ side }: { side: "left" | "right" }) {
  // Mobile: anchored to the fixed left-4 line. Desktop: anchored to the
  // li's inner edge (right-0 for left-side cards, left-0 for right-side
  // cards) so it lands exactly on the centered line regardless of which
  // half of the container the card occupies.
  const sideClasses =
    side === "left"
      ? "sm:left-auto sm:right-0 sm:translate-x-1/2"
      : "sm:left-0 sm:-translate-x-1/2";

  return (
    <span
      aria-hidden
      className={`absolute left-4 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-coral ring-4 ring-base ${sideClasses}`}
    />
  );
}

function Card({
  entry,
  reducedMotion,
}: {
  entry: ExperienceEntry;
  reducedMotion: boolean;
}) {
  const [expanded, setExpanded] = useState(!!entry.featured);
  const isPlaceholderOrg = entry.org === "Leadership Role (TBD)";

  return (
    <div
      className={`glass relative rounded-[1.75rem] px-6 py-5 ${
        entry.featured ? "sm:px-8 sm:py-7" : ""
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3
          data-placeholder={isPlaceholderOrg ? "experience-org" : undefined}
          className={`font-serif text-ink ${entry.featured ? "text-2xl sm:text-3xl" : "text-lg"}`}
        >
          {entry.org}
        </h3>
        <span className="font-mono text-[0.65rem] text-ink/70">
          {entry.start}
          {entry.end ? `–${entry.end}` : ""}
        </span>
      </div>
      <p className="mt-1 font-mono text-xs text-ink/75">{entry.role}</p>

      {entry.featured ? (
        <div className="mt-3 flex flex-col gap-2">
          <p data-placeholder="experience-summary" className="text-sm leading-relaxed text-ink/80">
            {entry.summary}
          </p>
          {entry.details?.map((detail, i) => (
            <p key={i} className="text-sm leading-relaxed text-ink/70">
              {detail}
            </p>
          ))}
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-3 font-mono text-[0.7rem] text-ink/75 underline-offset-2 hover:text-ink hover:underline"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
          <motion.div
            initial={false}
            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: durations.base, ease: easing.out }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 pt-2">
              <p data-placeholder="experience-summary" className="text-sm leading-relaxed text-ink/80">
                {entry.summary}
              </p>
              {entry.details?.map((detail, i) => (
                <p key={i} className="text-sm leading-relaxed text-ink/70">
                  {detail}
                </p>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

export default function Experience() {
  const reducedMotion = useReducedMotionSafe();
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section id="experience" className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:py-32">
      <h2 className="mb-10 font-mono text-xs uppercase tracking-wide text-ink/70">Experience</h2>

      <div ref={sectionRef} className="relative">
        <TimelineLine reducedMotion={reducedMotion} target={sectionRef} />

        {/* Mobile: single left-aligned column, dot+line at a fixed left
            offset, cards full-width to the right of it (pl-10).
            Desktop (sm+): centered line, cards alternate left/right in a
            true two-column layout — a deliberately different structure,
            not a scaled-down copy of the mobile stack. */}
        <ol className="flex flex-col gap-10">
          {experience.map((entry, i) => {
            const side: "left" | "right" = i % 2 === 0 ? "left" : "right";
            return (
              <li
                key={`${entry.org}-${entry.role}`}
                className={`relative pl-10 sm:w-1/2 sm:pl-0 ${
                  side === "left" ? "sm:pr-10" : "sm:ml-auto sm:pl-10"
                }`}
              >
                <Dot side={side} />
                <Card entry={entry} reducedMotion={reducedMotion} />
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
