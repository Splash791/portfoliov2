"use client";

import { motion } from "framer-motion";

export type BlobConfig = {
  color: string; // a palette bg-* utility class, e.g. "bg-coral"
  className: string; // position + size utilities, e.g. "left-[-10%] top-[-15%] h-[55vmax] w-[55vmax]"
  duration: number; // seconds per drift cycle
};

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
}: {
  blobs: BlobConfig[];
  reducedMotion: boolean;
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
            className={`absolute rounded-full opacity-50 blur-[90px] ${blob.color} ${blob.className}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full opacity-50 blur-[90px] ${blob.color} ${blob.className}`}
          animate={{
            x: [0, 40, -24, 0],
            y: [0, -32, 20, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
