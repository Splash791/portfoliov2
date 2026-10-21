"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { durations } from "@/lib/motion";

export type CarouselPhoto = {
  src: string;
  alt: string;
};

const AUTO_ADVANCE_MS = 4500;

/**
 * Shared image carousel (About's photo slot, Projects' `images` slot).
 * Shows an honest empty-state placeholder when `photos` is empty rather
 * than faking content -- see data/about-photos.ts / data/projects.ts for
 * how to fill it in.
 */
export default function PhotoCarousel({
  photos,
  reducedMotion,
  aspectClassName = "aspect-square",
  emptyLabel = "Photo carousel placeholder",
  sizes = "(min-width: 1024px) 40vw, 90vw",
  rounded = "rounded-[2rem]",
  showControls = true,
}: {
  photos: CarouselPhoto[];
  reducedMotion: boolean;
  aspectClassName?: string;
  emptyLabel?: string;
  sizes?: string;
  rounded?: string;
  // Prev/next/dot buttons are real <button> elements -- false when this
  // carousel is nested inside another interactive element (e.g. the whole
  // ProjectCard is a <button>; nested <button>s are invalid HTML and break
  // click handling). Auto-advance still cycles multiple photos either way.
  showControls?: boolean;
}) {
  const [rawIndex, setIndex] = useState(0);
  // Derived during render rather than synced via a second effect+setState
  // (that pattern trips react-hooks/set-state-in-effect, and is unnecessary
  // here): if `photos` changes to a shorter array between renders -- e.g. a
  // different project's card reuses this component -- `rawIndex` could
  // momentarily point past the end. Clamping on read is sufficient; no
  // state update, no extra render, no effect.
  const index = photos.length > 0 ? rawIndex % photos.length : 0;

  // Auto-advance only when there's more than one photo and motion isn't
  // reduced -- a single-photo carousel has nothing to advance to, and
  // reduced-motion users shouldn't get content that changes on its own.
  useEffect(() => {
    if (photos.length <= 1 || reducedMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [photos.length, reducedMotion]);

  if (photos.length === 0) {
    return (
      <div
        data-placeholder="photo-carousel"
        style={{ borderStyle: "dashed" }}
        className={`glass flex w-full flex-col items-center justify-center gap-2 ${rounded} ${aspectClassName}`}
      >
        <span className="font-mono text-[0.65rem] text-ink/65">{emptyLabel}</span>
      </div>
    );
  }

  const current = photos[index];

  function goTo(next: number) {
    setIndex((next + photos.length) % photos.length);
  }

  return (
    <div className={`glass relative flex w-full flex-col overflow-hidden ${rounded} ${aspectClassName}`}>
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.src}
            initial={reducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : durations.fast }}
            className="absolute inset-0"
          >
            <Image src={current.src} alt={current.alt} fill sizes={sizes} className="object-cover" />
          </motion.div>
        </AnimatePresence>
      </div>

      {showControls && photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo(index - 1);
            }}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-paper/70 font-mono text-sm text-ink backdrop-blur-sm transition-colors hover:bg-paper"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo(index + 1);
            }}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-paper/70 font-mono text-sm text-ink backdrop-blur-sm transition-colors hover:bg-paper"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(i);
                }}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? "bg-ink" : "bg-ink/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
