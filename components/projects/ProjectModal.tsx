"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { durations, easing } from "@/lib/motion";
import { useSoundEnabled } from "@/components/ui/SoundToggle";
import { playOpen, playClose, vibrate } from "@/lib/sound";

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
  const soundEnabled = useSoundEnabled();

  // Open sound/haptic fires once per project becoming non-null. Sound is
  // gated by reduced-motion too (section 0, bullet 4); haptics isn't a
  // visual motion effect so it only checks the sound/haptics toggle.
  useEffect(() => {
    if (!project) return;
    if (soundEnabled && !reducedMotion) playOpen();
    if (soundEnabled) vibrate(10);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per open, not on every reducedMotion/soundEnabled change
  }, [project]);

  function handleClose() {
    if (soundEnabled && !reducedMotion) playClose();
    if (soundEnabled) vibrate(10);
    onClose();
  }
  // Latest-callback ref so the keydown effect below can stay keyed on just
  // `project` (and not re-run — which would re-steal focus via the
  // `closeButtonRef.current?.focus()` below — every time soundEnabled,
  // reducedMotion, or onClose change identity).
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
            className="glass relative z-10 max-h-[90vh] w-full max-w-[calc(100vw-2rem)] overflow-y-auto rounded-[2rem] p-6 sm:max-w-lg sm:p-8"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              aria-label="Close project details"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 font-mono text-sm text-ink/70 hover:bg-ink/10"
            >
              ×
            </button>

            <h3
              id={`project-modal-title-${project.slug}`}
              className="pr-10 font-serif text-2xl text-ink sm:text-3xl"
            >
              {project.title}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-ink/80">
              {project.summary}
            </p>

            {/* Optional blocks below render only when the data is present.
                All 7 projects currently have these undefined (section 11:
                no real assets yet), so none of these blocks render at all
                right now — verified by the guards, not assumed. */}

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
                    <dt className="font-mono text-[0.6rem] uppercase text-ink/70">
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

            {(project.links.github || project.links.demo) && (
              <div className="mt-6 flex flex-wrap gap-3">
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-ink px-5 py-2.5 font-mono text-xs text-[var(--color-base)]"
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
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
