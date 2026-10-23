"use client";

import { useRef, useSyncExternalStore } from "react";
import { useReducedMotionSafe } from "@/lib/motion";
import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getHashSlug(): string | null {
  const hash = window.location.hash.replace("#", "");
  return projects.some((p) => p.slug === hash) ? hash : null;
}

function getServerHashSlug(): string | null {
  return null;
}

// pushState (not a `location.hash =` assignment) so closing never triggers
// the browser's native scroll-to-anchor-id behavior; the manual event keeps
// the useSyncExternalStore subscription in sync since pushState alone
// doesn't fire "hashchange".
function setHash(nextHash: string) {
  window.history.pushState(null, "", `#${nextHash}`);
  window.dispatchEvent(new Event("hashchange"));
}

export default function Projects() {
  const reducedMotion = useReducedMotionSafe();
  // Selection state lives entirely in the URL hash (an external system) and
  // is read via useSyncExternalStore rather than mirrored into useState from
  // an effect -- this is also what makes the initial deep-link-on-load case
  // free of any post-mount setState/hydration-mismatch risk.
  const selectedSlug = useSyncExternalStore(subscribeToHash, getHashSlug, getServerHashSlug);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function openProject(slug: string) {
    setHash(slug);
  }

  function closeProject() {
    const previousSlug = selectedSlug;
    setHash("projects");
    if (previousSlug) {
      triggerRefs.current[previousSlug]?.focus();
    }
  }

  const selectedProject = projects.find((p) => p.slug === selectedSlug) ?? null;

  return (
    <section
      id="projects"
      className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:py-32"
    >
      <h2 className="mb-10 font-mono text-xs uppercase tracking-wide text-ink/70">
        Projects
      </h2>

      {/* Bento grid: FarmOS (featured: true) spans 2 columns via
          ProjectCard's own span classes -- width-only, no row-span/fixed
          row height, so every card keeps natural content height and
          nothing risks clipping. `grid-flow-dense` lets smaller tiles
          fill in beside the wide one instead of leaving a gap. Mobile
          stays a plain single-column stack (span classes are sm:/lg:-
          gated), so FarmOS there just reads as a card with visible full
          summary + metric badge, not a forced shape that doesn't fit.
          `items-start`: CSS Grid's own default (`align-items: stretch`)
          would otherwise stretch every card in a row to match its tallest
          sibling regardless of span -- at `lg:` specifically, dense flow
          packs a normal card into the same row as the much-taller featured
          tile, which was leaving a large empty gap below that card's own
          (much shorter) content. */}
      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 sm:grid-flow-dense lg:grid-cols-3">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            reducedMotion={reducedMotion}
            isOpen={selectedSlug === project.slug}
            onOpen={openProject}
            triggerRef={(el) => {
              triggerRefs.current[project.slug] = el;
            }}
          />
        ))}
      </div>

      <ProjectModal
        project={selectedProject}
        reducedMotion={reducedMotion}
        onClose={closeProject}
      />
    </section>
  );
}
