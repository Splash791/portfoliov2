"use client";

import { motion } from "framer-motion";

export type BlobConfig = {
  color: string; // a palette bg-* utility class, e.g. "bg-coral"
  className: string; // position + size utilities, e.g. "left-[-10%] top-[-15%] h-[55vmax] w-[55vmax]"
  duration: number; // seconds per drift cycle
};

// A fixed organic (non-circular) blob outline, used for the reduced-motion
// static shape and as the resting frame of the animated morph below --
// per direct request for the blobs to feel less uniform/"cool" than a
// plain circle.
const BASE_RADIUS = "58% 42% 38% 62% / 55% 44% 56% 45%";

// Deterministic pseudo-random, seeded by index -- real Math.random() here
// would differ between the server's first render and the client's (this
// runs during render, not inside an effect), causing a hydration mismatch
// on every value it touches. Same seed always produces the same path, so
// each blob's "randomness" is stable across re-renders and SSR/CSR.
function seeded(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Builds a unique drift path per blob -- varied amplitude, direction,
 * rotation, a subtle organic shape morph, and a one-time phase delay so
 * blobs don't all move in lockstep -- instead of every blob sharing one
 * identical back-and-forth loop differing only by duration. `peakOpacity`
 * bounds the breathing range from above, so it never exceeds whatever
 * opacity the caller already verified against contrast.
 */
function buildPath(index: number, duration: number, peakOpacity: number) {
  const s = (offset: number) => seeded(index * 13 + offset);
  const dirX = s(1) > 0.5 ? 1 : -1;
  const dirY = s(2) > 0.5 ? 1 : -1;
  const ampX = 28 + s(3) * 54; // 28-82px
  const ampY = 28 + s(4) * 54;
  const rot = 6 + s(5) * 10; // 6-16deg swing

  return {
    x: [0, dirX * ampX, dirX * -ampX * 0.45, dirX * ampX * 0.3, 0],
    y: [0, dirY * -ampY * 0.55, dirY * ampY, dirY * -ampY * 0.3, 0],
    scale: [1, 1 + s(6) * 0.16, 1 - s(7) * 0.1, 1 + s(8) * 0.07, 1],
    rotate: [0, rot, -rot * 0.5, rot * 0.25, 0],
    opacity: [
      peakOpacity * 0.8,
      peakOpacity,
      peakOpacity * 0.88,
      peakOpacity * 0.94,
      peakOpacity * 0.8,
    ],
    borderRadius: [
      BASE_RADIUS,
      "42% 58% 62% 38% / 44% 56% 44% 56%",
      "50% 50% 36% 64% / 60% 42% 58% 40%",
      "46% 54% 58% 42% / 50% 48% 52% 50%",
      BASE_RADIUS,
    ],
    // `delay` only applies before the first cycle, not between repeats --
    // this is what staggers start phase without affecting loop speed.
    delay: s(9) * duration,
  };
}

/**
 * Shared blurred mesh-blob backdrop (section 3 of the original brief) --
 * extracted from Hero.tsx so the same pattern can sit behind other
 * sections too, each with its own `blobs` config, instead of staying a
 * one-off Hero effect. Caller owns a `relative overflow-hidden` ancestor;
 * this only renders the absolutely-positioned blob layer itself.
 */
export default function SectionBlobs({
  blobs,
  reducedMotion,
  opacity = 0.5,
  blurPx = 90,
}: {
  blobs: BlobConfig[];
  reducedMotion: boolean;
  // Overridable per call so sections can run a more prominent treatment
  // than Hero's without touching Hero's own call (it relies on these
  // defaults) -- added after direct feedback that Experience/Projects'
  // blobs, mostly cropped into far corners and sitting behind a dense
  // glass-card grid, read as "no difference" from plain paper.
  opacity?: number;
  blurPx?: number;
}) {
  // Under reduced motion these render as static shapes (no `animate` loop at
  // all) rather than an animated one paused mid-frame — this is the gate,
  // not a duration tweak.
  if (reducedMotion) {
    return (
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        {blobs.map((blob, i) => (
          <div
            key={i}
            className={`absolute ${blob.color} ${blob.className}`}
            style={{ opacity, filter: `blur(${blurPx}px)`, borderRadius: BASE_RADIUS }}
          />
        ))}
      </div>
    );
  }

  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {blobs.map((blob, i) => {
        const path = buildPath(i, blob.duration, opacity);
        return (
          <motion.div
            key={i}
            className={`absolute ${blob.color} ${blob.className}`}
            style={{ filter: `blur(${blurPx}px)` }}
            initial={{
              x: 0,
              y: 0,
              scale: 1,
              rotate: 0,
              opacity: path.opacity[0],
              borderRadius: BASE_RADIUS,
            }}
            animate={{
              x: path.x,
              y: path.y,
              scale: path.scale,
              rotate: path.rotate,
              opacity: path.opacity,
              borderRadius: path.borderRadius,
            }}
            transition={{ duration: blob.duration, delay: path.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}
