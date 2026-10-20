import type { ReactNode } from "react";

/**
 * Full-viewport scroll-snap wrapper (user request: each section takes the
 * full page, scrolling "hops" to the next). Lives in app/page.tsx as a
 * wrapper around each section component rather than inside the section
 * components themselves, specifically so it doesn't collide with other
 * in-flight edits to Hero/About/Experience/Projects/Travel/Writing.
 *
 * `min-h-dvh` (not a hard `h-dvh`) so a section taller than one viewport —
 * e.g. Projects' grid, Experience's cards — isn't clipped: it still snaps
 * to its start, but keeps scrolling naturally past the snap point if its
 * content needs more room, rather than hiding content to force an exact
 * fit.
 */
export default function SnapSection({ children }: { children: ReactNode }) {
  return (
    <div className="snap-start flex min-h-dvh flex-col justify-center">
      {children}
    </div>
  );
}
