/**
 * Static fade into/out of a plain-paper section boundary -- extracted from
 * Hero.tsx's own bottom fade so every blob/plain handoff in the page's
 * "Blob Rhythm" gets the same soft transition, not just Hero's single
 * bespoke exit. Not scroll- or motion-driven, so it needs no reduced-
 * motion gate. Sits above the blobs (-z-10) but below foreground content
 * (give foreground content z-10 or higher).
 */
export default function SectionEdgeFade({ edge }: { edge: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 z-[5] h-32 sm:h-48 ${
        edge === "top"
          ? "top-0 bg-gradient-to-b from-paper to-transparent"
          : "bottom-0 bg-gradient-to-b from-transparent to-paper"
      }`}
    />
  );
}
