"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { durations } from "@/lib/motion";
import type { AboutPhoto } from "@/data/about-photos";

const AUTO_ADVANCE_MS = 4500;

export default function PhotoCarousel({
  photos,
  reducedMotion,
}: {
  photos: AboutPhoto[];
  reducedMotion: boolean;
}) {
  const [index, setIndex] = useState(0);

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
    // Same dashed-placeholder treatment as the headshot slot (About.tsx) --
    // no real casual photos exist yet, so this is an honest empty state,
    // not a faked carousel. See data/about-photos.ts for how to fill it.
    return (
      <div
        data-placeholder="casual-photos"
        style={{ borderStyle: "dashed" }}
        className="glass flex aspect-square flex-1 flex-col items-center justify-center gap-2 rounded-[2rem]"
      >
        <span className="font-mono text-[0.65rem] text-ink/65">Photo carousel placeholder</span>
      </div>
    );
  }

  const current = photos[index];

  function goTo(next: number) {
    setIndex((next + photos.length) % photos.length);
  }

  return (
    <div className="glass relative flex aspect-square flex-1 flex-col overflow-hidden rounded-[2rem]">
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
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-paper/70 font-mono text-sm text-ink backdrop-blur-sm transition-colors hover:bg-paper"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
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
                onClick={() => goTo(i)}
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
