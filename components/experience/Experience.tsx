"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { experience, type Experience as ExperienceEntry } from "@/data/experience";
import { durations, easing, useReducedMotionSafe } from "@/lib/motion";

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
  const featured = experience.find((entry) => entry.featured);
  const rest = experience.filter((entry) => !entry.featured);

  return (
    <section id="experience" className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:py-32">
      <h2 className="mb-10 font-mono text-xs uppercase tracking-wide text-ink/70">Experience</h2>

      {/* No timeline/connecting-line metaphor -- the featured entry stands
          alone up top (full-width, expanded by default), the rest sit in
          a grid below it. Single column on mobile, two columns from `sm:`
          up -- a deliberate breakpoint-driven layout, not a shrunk copy. */}
      <div className="flex flex-col gap-6">
        {featured && <Card entry={featured} reducedMotion={reducedMotion} />}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {rest.map((entry) => (
            <Card key={`${entry.org}-${entry.role}`} entry={entry} reducedMotion={reducedMotion} />
          ))}
        </div>
      </div>
    </section>
  );
}
