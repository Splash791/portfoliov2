"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { Trip } from "@/data/trips";
import { durations, easing } from "@/lib/motion";
import { useSoundEnabled } from "@/components/ui/SoundToggle";
import { playOpen, playClose, vibrate } from "@/lib/sound";

const MODE_LABEL: Record<Trip["routes"][number]["mode"], string> = {
  flight: "Flight",
  bus: "Bus",
  train: "Train",
};

export default function TripGallery({
  trip,
  reducedMotion,
  onClose,
}: {
  trip: Trip | null;
  reducedMotion: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const soundEnabled = useSoundEnabled();

  // Same open sound/haptic + reduced-motion gate as ProjectModal.
  useEffect(() => {
    if (!trip) return;
    if (soundEnabled && !reducedMotion) playOpen();
    if (soundEnabled) vibrate(10);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per open, not on every reducedMotion/soundEnabled change
  }, [trip]);

  function handleClose() {
    if (soundEnabled && !reducedMotion) playClose();
    if (soundEnabled) vibrate(10);
    onClose();
  }
  // Latest-callback ref so the keydown effect below stays keyed on just
  // `trip` — see ProjectModal.tsx for why (avoids re-stealing focus).
  const handleCloseRef = useRef(handleClose);
  useEffect(() => {
    handleCloseRef.current = handleClose;
  });

  useEffect(() => {
    if (!trip) return;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const root = panelRef.current;
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
  }, [trip]);

  return (
    <AnimatePresence>
      {trip && (
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
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-gallery-title"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
            transition={
              reducedMotion ? { duration: 0 } : { duration: durations.base, ease: easing.out }
            }
            className="glass relative z-10 max-h-[90vh] w-full max-w-[calc(100vw-2rem)] overflow-y-auto rounded-[2rem] p-6 sm:max-w-lg sm:p-8"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              aria-label="Close trip details"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 font-mono text-sm text-ink/70 hover:bg-ink/10"
            >
              ×
            </button>

            <p className="font-mono text-[0.65rem] uppercase tracking-wide text-ink/70">
              {trip.status === "upcoming" ? "Upcoming" : "Past trip"}
            </p>
            <h3
              id="trip-gallery-title"
              className="mt-1 pr-10 font-serif text-2xl text-ink sm:text-3xl"
            >
              {trip.title}
            </h3>

            <ul className="mt-4 flex flex-wrap gap-2">
              {trip.stops.map((stop) => (
                <li
                  key={stop.name}
                  className="rounded-full bg-ink/5 px-3 py-1 font-mono text-xs text-ink/70"
                >
                  {stop.name}
                </li>
              ))}
            </ul>

            {trip.routes.length > 0 && (
              <ul className="mt-4 flex flex-col gap-1.5 border-t border-ink/10 pt-4">
                {trip.routes.map((route, i) => (
                  <li key={i} className="text-sm text-ink/80">
                    {route.from} &rarr; {route.to}{" "}
                    <span className="font-mono text-xs text-ink/70">
                      ({MODE_LABEL[route.mode]})
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {trip.notes ? (
              <p className="mt-4 text-sm leading-relaxed text-ink/80">{trip.notes}</p>
            ) : (
              <p
                data-placeholder="trip-notes"
                className="mt-4 text-sm leading-relaxed text-ink/70"
              >
                TODO: trip notes not written yet.
              </p>
            )}

            {trip.photos && trip.photos.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-2">
                {trip.photos.map((photo) => (
                  <div
                    key={photo.src}
                    className="relative aspect-square overflow-hidden rounded-xl"
                  >
                    <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div
                data-placeholder="trip-photos"
                style={{ borderStyle: "dashed" }}
                className="glass mt-5 flex items-center justify-center rounded-xl py-8 font-mono text-[0.65rem] text-ink/65"
              >
                Photo gallery placeholder
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
