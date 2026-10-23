"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { durations, easing } from "@/lib/motion";
import PhotoCarousel from "@/components/ui/PhotoCarousel";

export default function ProjectModal({
  project,
  reducedMotion,
  onClose,
}: {
  project: Project | null;
  reducedMotion: boolean;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function handleClose() {
    onClose();
  }
  // Latest-callback ref so the keydown effect below can stay keyed on just
  // `project` (and not re-run — which would re-steal focus via the
  // `closeButtonRef.current?.focus()` below — every time `onClose`
  // changes identity).
  const handleCloseRef = useRef(handleClose);
  useEffect(() => {
    handleCloseRef.current = handleClose;
  });

  useEffect(() => {
    if (!project) return;
    closeButtonRef.current?.focus();

    // Minimal focus trap: Esc closes; Tab/Shift+Tab wraps within the modal
    // instead of escaping to the page behind it.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const root = containerRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : durations.fast }}
        >
          <div
            aria-hidden
            onClick={handleClose}
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
          />

          <motion.div
            ref={containerRef}
            layoutId={`project-${project.slug}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`project-modal-title-${project.slug}`}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: durations.base, ease: easing.out }
            }
            // Dashed border carries the card's placeholder signal through
            // the shared-element morph instead of snapping to a solid
            // border mid-animation.
            style={project.placeholder ? { borderStyle: "dashed" } : undefined}
            className="glass relative z-10 max-h-[90vh] w-full max-w-[calc(100vw-2rem)] overflow-y-auto rounded-[2rem] p-6 sm:max-w-lg sm:p-8"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              aria-label="Close project details"
              // `bg-paper/70 backdrop-blur-sm`, not `.glass`'s usual
              // treatment or a flat `bg-ink/5` -- matches PhotoCarousel's
              // own circular-control convention so this stays legible
              // whether it's sitting over the plain glass panel or
              // directly on top of a project's cover image below.
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-paper/70 font-mono text-sm text-ink backdrop-blur-sm transition-colors hover:bg-paper"
            >
              ×
            </button>

            {/* Cover image/carousel -- the modal's own image slot (the
                "overlay"), separate from the card's. Same `cover`/`images`
                data as the card, so renders only when that data exists;
                neither field being set (the two still-`placeholder`
                projects) means no image block at all here, not a faked
                placeholder. */}
            {project.images && project.images.length > 0 ? (
              <div className="-mx-6 -mt-6 mb-4 sm:-mx-8 sm:-mt-8 sm:mb-5">
                <PhotoCarousel
                  photos={project.images}
                  reducedMotion={reducedMotion}
                  aspectClassName="aspect-video"
                  rounded="rounded-t-[2rem]"
                />
              </div>
            ) : (
              project.cover && (
                // `object-contain` in a generously-tall (not aspect-locked)
                // box, not `object-cover` in a fixed aspect-video crop --
                // per direct request, the modal shows the whole image
                // uncropped. `bg-ink/5` fills any letterbox space when the
                // image's real aspect ratio doesn't match the box instead
                // of leaving a jarring transparent/white gap.
                <div className="relative -mx-6 -mt-6 mb-4 h-[22rem] w-[calc(100%+3rem)] overflow-hidden rounded-t-[2rem] bg-ink/5 sm:-mx-8 sm:-mt-8 sm:mb-5 sm:h-[26rem] sm:w-[calc(100%+4rem)]">
                  <Image
                    src={project.cover}
                    alt={`${project.title} cover`}
                    fill
                    sizes="(min-width: 640px) 32rem, 100vw"
                    className="object-contain"
                  />
                </div>
              )
            )}

            <h3
              id={`project-modal-title-${project.slug}`}
              className="pr-10 font-serif text-2xl text-ink sm:text-3xl"
            >
              {project.title}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-ink/80">
              {project.summary}
            </p>

            {project.details && project.details.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {project.details.map((detail, i) => (
                  <p key={i} className="text-sm leading-relaxed text-ink/70">
                    {detail}
                  </p>
                ))}
              </div>
            )}

            {project.placeholder && (
              <span className="mt-3 inline-block rounded-full border border-dashed border-ink/20 bg-ink/5 px-2.5 py-1 font-mono text-xs text-ink/65">
                Write-up in progress
              </span>
            )}

            {/* Optional blocks below render only when the data is present
                -- guards verified, not assumed. FarmOS now has real
                stack/metrics; the three `placeholder: true` projects still
                have none of these set (section 11: no real assets yet). */}

            {project.stack.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-ink/5 px-3 py-1 font-mono text-xs text-ink/75"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {project.metrics && project.metrics.length > 0 && (
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {project.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-xl bg-ink/5 px-3 py-2">
                    <dt className="font-mono text-xs uppercase text-ink/70">
                      {metric.label}
                    </dt>
                    <dd className="mt-0.5 text-sm text-ink">{metric.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {project.architecture && (
              <div className="relative mt-5 aspect-video w-full overflow-hidden rounded-xl">
                <Image
                  src={project.architecture}
                  alt={`${project.title} architecture diagram`}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {project.video && (
              <video
                src={project.video}
                muted
                loop
                playsInline
                autoPlay
                className="mt-5 w-full rounded-xl"
              />
            )}

            {project.screenshots && project.screenshots.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-2">
                {project.screenshots.map((src) => (
                  <div key={src} className="relative aspect-video overflow-hidden rounded-xl">
                    <Image
                      src={src}
                      alt={`${project.title} screenshot`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {(project.links.github || project.links.demo || project.links.devpost) && (
              <div className="mt-6 flex flex-wrap gap-3">
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-ink px-5 py-2.5 font-mono text-xs text-[var(--color-paper)]"
                  >
                    GitHub
                  </a>
                )}
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="glass rounded-full px-5 py-2.5 font-mono text-xs text-ink"
                  >
                    Demo
                  </a>
                )}
                {project.links.devpost && (
                  <a
                    href={project.links.devpost}
                    target="_blank"
                    rel="noreferrer"
                    className="glass rounded-full px-5 py-2.5 font-mono text-xs text-ink"
                  >
                    Devpost
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
