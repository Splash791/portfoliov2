"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { experience, type Experience as ExperienceEntry } from "@/data/experience";
import { durations, easing, useReducedMotionSafe } from "@/lib/motion";
import SectionBlobs, { type BlobConfig } from "@/components/ui/SectionBlobs";
import SectionEdgeFade from "@/components/ui/SectionEdgeFade";

// A different three-tone slice of the same earth family than Hero's
// (khaki/cream/umber instead of tan/white/khaki/cream), at different
// positions -- continues the blob pattern per direct request without
// reading as a copy-pasted repeat of the hero. Fewer/smaller blobs than
// Hero's five: this section is text-dense (cards, timestamps, expand
// controls), so the backdrop stays a quieter presence behind the glass
// cards rather than competing with them.
//
// Positioned off-axis (not mirrored/evenly spaced) and pushed further
// past the edges than Hero's set -- per direct request ("bleed out or
// fade out as it reaches the edges randomly"), these read as organic
// bleed rather than a centered, contained trio. Sizes capped with
// `min(vmax,rem)` for the same reason as Hero's (see Hero.tsx).
const BLOBS: BlobConfig[] = [
  { color: "bg-amber", className: "right-[-22%] top-[-18%] h-[min(40vmax,25rem)] w-[min(40vmax,25rem)]", duration: 30 },
  { color: "bg-peach", className: "left-[-18%] bottom-[18%] h-[min(32vmax,20rem)] w-[min(32vmax,20rem)]", duration: 25 },
  { color: "bg-rose", className: "right-[6%] bottom-[-26%] h-[min(28vmax,17rem)] w-[min(28vmax,17rem)]", duration: 34 },
  { color: "bg-sage", className: "left-[22%] top-[-14%] h-[min(20vmax,12rem)] w-[min(20vmax,12rem)]", duration: 20 },
];

function Card({
  entry,
  reducedMotion,
}: {
  entry: ExperienceEntry;
  reducedMotion: boolean;
}) {
  // All cards start collapsed, including the featured one -- per direct
  // request, Deloitte no longer defaults to expanded on every load.
  const [expanded, setExpanded] = useState(false);
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
          className={`font-serif text-ink ${entry.featured ? "text-2xl sm:text-3xl" : "text-lg"}`}
        >
          {entry.role}
        </h3>
        <span className="font-mono text-xs text-ink/70">
          {entry.start}
          {entry.end ? `–${entry.end}` : ""}
        </span>
      </div>
      <p
        data-placeholder={isPlaceholderOrg ? "experience-org" : undefined}
        className="mt-1 font-mono text-xs text-ink/75"
      >
        {entry.org}
      </p>

      {/* Summary is always visible, on every card -- only the detail
          bullets live behind Expand/Collapse. A fixed rem value, not `ch`
          -- Geist's own `ch` glyph measures wider than this font's real
          average character width, so a `ch`-based cap under-constrains the
          line (same fix as the blog article body in
          app/blog/[slug]/page.tsx). */}
      <p
        data-placeholder="experience-summary"
        className="mt-3 max-w-[30rem] text-sm leading-relaxed text-ink/80"
      >
        {entry.summary}
      </p>

      {!!entry.details?.length && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-3 font-mono text-xs text-ink/75 underline-offset-2 hover:text-ink hover:underline"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
          <motion.div
            initial={false}
            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: durations.base, ease: easing.out }}
            className="max-w-[30rem] overflow-hidden"
          >
            <div className="flex flex-col gap-2 pt-2">
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
    <section
      id="experience"
      // Full-width/`min-h-dvh`, not the old `max-w-5xl` on this element
      // itself: that had confined `SectionBlobs`' `absolute inset-0` layer
      // to the same centered 1024px column as the content, so the blobs
      // never reached the real viewport edges, and the section's own
      // height could fall short of SnapSection's `min-h-dvh` wrapper and
      // expose plain paper above/below (same fix Hero already has, see
      // Hero.tsx). The width constraint now lives on the inner content
      // wrapper below instead.
      className="relative flex min-h-dvh w-full flex-col justify-center overflow-hidden py-24 sm:py-32"
    >
      <SectionBlobs blobs={BLOBS} reducedMotion={!!reducedMotion} />
      <SectionEdgeFade edge="top" />
      <SectionEdgeFade edge="bottom" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
        <h2 className="mb-10 font-mono text-xs uppercase tracking-wide text-ink/70">Experience</h2>

        {/* One chronological grid, not a "featured leads, rest follow" split
            -- Deloitte keeps its larger bento-tile sizing via `entry.featured`'s
            sm:col-span-2 styling in Card (though no longer an expanded-by-
            default state), and renders in its actual chronological position
            (currently last), not pulled to the front. Single column on
            mobile, two from `sm:` up. */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {experience.map((entry) => (
            <Card key={`${entry.org}-${entry.role}`} entry={entry} reducedMotion={reducedMotion} />
          ))}
        </div>
      </div>
    </section>
  );
}
