"use client";

import { motion } from "framer-motion";
import type { Project } from "@/data/projects";

// Deterministic gradient fallback for covers (schema: `cover` falls back to
// a generated gradient when absent — every project is missing one right now).
const GRADIENTS = [
  "from-coral to-amber",
  "from-violet to-rose",
  "from-amber to-peach",
  "from-rose to-coral",
  "from-peach to-violet",
  "from-coral to-violet",
  "from-amber to-rose",
];

export default function ProjectCard({
  project,
  index,
  reducedMotion,
  isOpen,
  onOpen,
  triggerRef,
}: {
  project: Project;
  index: number;
  reducedMotion: boolean;
  isOpen: boolean;
  onOpen: (slug: string) => void;
  triggerRef: (el: HTMLButtonElement | null) => void;
}) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const stackPreview = project.stack.slice(0, 3);

  return (
    <motion.button
      ref={triggerRef}
      type="button"
      // Only one element may own this layoutId at a time (section 6's
      // shared-element morph). While the modal is open it is the sole
      // owner; the card gives it up so Framer animates card -> modal
      // and back cleanly instead of two elements claiming the same id.
      layoutId={isOpen ? undefined : `project-${project.slug}`}
      onClick={() => onOpen(project.slug)}
      aria-haspopup="dialog"
      aria-hidden={isOpen}
      tabIndex={isOpen ? -1 : 0}
      whileHover={
        reducedMotion || isOpen
          ? undefined
          : { rotate: index % 2 === 0 ? -1 : 1, scale: 1.015 }
      }
      transition={{ duration: 0.2 }}
      style={isOpen ? { opacity: 0, pointerEvents: "none" } : undefined}
      className="glass flex flex-col overflow-hidden rounded-[1.75rem] text-left"
    >
      <div
        aria-hidden
        className={`h-36 w-full bg-gradient-to-br ${gradient}`}
      />
      <div className="flex flex-1 flex-col gap-2 px-5 py-4">
        <h3 className="font-serif text-xl text-ink">{project.title}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink/70">
          {project.summary}
        </p>
        {stackPreview.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {stackPreview.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-ink/5 px-2.5 py-1 font-mono text-[0.65rem] text-ink/75"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}
