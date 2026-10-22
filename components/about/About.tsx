"use client";

import { useReducedMotionSafe } from "@/lib/motion";
import { aboutPhotos } from "@/data/about-photos";
import PhotoCarousel from "@/components/ui/PhotoCarousel";

// TODO(section 12): bio copy is an open item — write a first-person draft
// together, or swap in the user's own. Voice is locked: curious builder +
// avid traveler. Keep this generic in content, specific in tone only.
const LEAD =
  "I like taking things apart until I understand how they work, then building my own version and shipping it. Outside of code, that same curiosity sends me chasing new cities, trains, and trail maps — travel's less a break from building and more another way to do it.";

export default function About() {
  const reducedMotion = useReducedMotionSafe();

  return (
    <section id="about" className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:py-32">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="flex flex-col gap-6">
          <h2 className="font-mono text-xs uppercase tracking-wide text-ink/70">About</h2>

          {/* Plain, fully-opaque text -- no word-by-word scroll-tied fade.
              That effect (opacity ramping per word as it scrolled into
              view) read as broken/half-gray text rather than a reveal,
              especially in any static view of the page; removed per
              direct request. */}
          <p
            data-placeholder="about-lead"
            className="font-serif text-2xl leading-snug text-ink sm:text-3xl lg:text-4xl"
          >
            {LEAD}
          </p>
        </div>

        {/* Single photo carousel in place of the old headshot + separate
            casual-photo boxes -- one slot, not two. */}
        <PhotoCarousel photos={aboutPhotos} reducedMotion={!!reducedMotion} />
      </div>
    </section>
  );
}
