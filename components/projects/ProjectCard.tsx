"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Project } from "@/data/projects";
import PhotoCarousel from "@/components/ui/PhotoCarousel";

// Deterministic gradient fallback for covers (schema: `cover` falls back to
// a generated gradient when absent — every project is missing one right now).
const GRADIENTS = [
  "from-coral to-amber",
  "from-sage to-rose",
  "from-amber to-peach",
  "from-rose to-coral",
  "from-peach to-sage",
  "from-coral to-sage",
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
  const featured = !!project.featured;
  const isPlaceholder = !!project.placeholder;

  return (
    <motion.button
      ref={triggerRef}
      type="button"
      data-monkey-anchor="project-card"
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
      // Dashed border marks this as a known-placeholder slot, same
      // convention as the hero headshot box and PhotoCarousel's empty
      // state -- it must win over `.glass`'s own border shorthand at
      // equal specificity, so it's set inline rather than as a class.
      style={
        isOpen
          ? { opacity: 0, pointerEvents: "none" }
          : isPlaceholder
            ? { borderStyle: "dashed" }
            : undefined
      }
      className={`glass relative flex flex-col overflow-hidden rounded-[1.75rem] text-left ${
        // Bento sizing: the featured tile spans 2 columns so it reads as
        // the standout tile. Deliberately width-only, no row-span/fixed
        // row height -- every card keeps natural content-driven height,
        // so nothing risks clipping inside a forced-height grid cell.
        featured ? "sm:col-span-2 lg:col-span-2" : ""
      }`}
    >
      {featured && (
        <span className="glass absolute right-4 top-4 z-10 rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wide text-ink/80">
          Featured
        </span>
      )}

      {/* Image slot (data/projects.ts): `images: [{src,alt}, ...]` renders a
          carousel (prev/next + dots); a single `cover` renders a static
          image; neither falls back to a deterministic gradient so the grid
          stays uniform for projects without screenshots yet. */}
      {project.images && project.images.length > 0 ? (
        // No prev/next/dot controls here -- the whole card is itself a
        // <button> (opens the modal), and nested <button>s are invalid
        // HTML. Auto-advance still cycles multiple images; the full
        // interactive carousel (with controls) belongs in the modal.
        <PhotoCarousel
          photos={project.images}
          reducedMotion={reducedMotion}
          aspectClassName={featured ? "h-56 lg:h-72" : "h-52"}
          rounded="rounded-none"
          sizes={featured ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          showControls={false}
        />
      ) : project.cover ? (
        <div
          className={`relative w-full overflow-hidden ${featured ? "h-56 lg:h-72" : "h-52"}`}
        >
          <Image
            src={project.cover}
            alt=""
            fill
            sizes={featured ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
            className="object-cover"
          />
        </div>
      ) : (
        <div
          aria-hidden
          className={`w-full bg-gradient-to-br ${gradient} ${featured ? "h-56 lg:h-72" : "h-52"}`}
        />
      )}
      <div className="flex flex-1 flex-col gap-2 px-5 py-4">
        <h3 className={`font-serif text-ink ${featured ? "text-2xl" : "text-xl"}`}>
          {project.title}
        </h3>
        {/* Featured cards show the full (unclamped) summary at the card's
            full two-column width -- a max-w caps the reading measure there.
            A fixed rem value, not `ch`: Geist's own `ch` glyph measures
            wider than this font's real average character width, so a
            `ch`-based cap under-constrains the line (same fix as
            Experience.tsx's featured-card summary). */}
        <p
          className={`text-sm leading-relaxed text-ink/70 ${featured ? "max-w-[30rem]" : "line-clamp-2"}`}
        >
          {project.summary}
        </p>

        {featured && project.metrics && project.metrics.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {project.metrics.map((metric) => (
              <span
                key={metric.label}
                className="rounded-full bg-coral/15 px-2.5 py-1 font-mono text-xs text-ink"
              >
                {metric.label}: {metric.value}
              </span>
            ))}
          </div>
        )}

        {isPlaceholder ? (
          // Fills the same slot the stack-chip row would occupy, so a
          // placeholder card doesn't just leave unexplained blank space
          // under its summary -- names itself as "in progress" rather
          // than reading as abandoned next to a finished card.
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-dashed border-ink/20 bg-ink/5 px-2.5 py-1 font-mono text-xs text-ink/65">
              Write-up in progress
            </span>
          </div>
        ) : (
          stackPreview.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {stackPreview.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-ink/5 px-2.5 py-1 font-mono text-xs text-ink/75"
                >
                  {tech}
                </span>
              ))}
            </div>
          )
        )}
      </div>
    </motion.button>
  );
}
