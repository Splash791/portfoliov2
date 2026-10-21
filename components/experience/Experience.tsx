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
        // Bento sizing (same pattern as Projects): featured spans both
        // columns and gets more padding, but stays wherever it falls in
        // chronological order instead of being pulled out to always lead.
        entry.featured ? "sm:col-span-2 sm:px-8 sm:py-7" : ""
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

  return (
    <section id="experience" className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:py-32">
      <h2 className="mb-10 font-mono text-xs uppercase tracking-wide text-ink/70">Experience</h2>

      {/* One chronological grid, not a "featured leads, rest follow" split
          -- Deloitte keeps its bigger/expanded-by-default treatment via
          `entry.featured`'s sm:col-span-2 styling in Card, but renders in
          its actual chronological position (currently last), not pulled
          to the front. Single column on mobile, two from `sm:` up. */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {experience.map((entry) => (
          <Card key={`${entry.org}-${entry.role}`} entry={entry} reducedMotion={reducedMotion} />
        ))}
      </div>
    </section>
  );
}
