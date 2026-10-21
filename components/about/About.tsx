"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/motion";
import { aboutPhotos } from "@/data/about-photos";
import PhotoCarousel from "@/components/ui/PhotoCarousel";

// TODO(section 12): bio copy is an open item — write a first-person draft
// together, or swap in the user's own. Voice is locked: curious builder +
// avid traveler. Keep this generic in content, specific in tone only.
const LEAD =
  "I like taking things apart until I understand how they work, then building my own version and shipping it. Outside of code, that same curiosity sends me chasing new cities, trains, and trail maps — travel's less a break from building and more another way to do it.";

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

  return (
    <section id="about" className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:py-32">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="flex flex-col gap-6">
          <h2 className="font-mono text-xs uppercase tracking-wide text-ink/70">About</h2>

          <LeadReveal text={LEAD} reducedMotion={reducedMotion} />
        </div>

        {/* Single photo carousel in place of the old headshot + separate
            casual-photo boxes -- one slot, not two. */}
        <PhotoCarousel photos={aboutPhotos} reducedMotion={!!reducedMotion} />
      </div>
    </section>
  );
}
