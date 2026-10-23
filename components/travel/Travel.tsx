"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useSyncExternalStore } from "react";
import { useInView } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/motion";
import { trips, TRIP_PIN_COLORS } from "@/data/trips";
import TripGallery from "./TripGallery";

function GlobeFallback({ reason }: { reason: string }) {
  // Matches TravelGlobe.tsx's own sizing exactly, so swapping between the
  // fallback and the real globe never changes the section's layout size.
  return (
    <div className="glass mx-auto flex aspect-square w-[min(calc(100dvh-22rem),100%)] items-center justify-center rounded-[2rem] sm:w-[min(calc(100dvh-24rem),100%)]">
      <p className="font-mono text-xs text-ink/65">{reason}</p>
    </div>
  );
}

// Touches browser globals (canvas/WebGL) -- dynamically imported with no
// SSR, per section 2's explicit "no SSR" instruction for the globe.
const TravelGlobe = dynamic(() => import("./TravelGlobe"), {
  ssr: false,
  loading: () => <GlobeFallback reason="Loading globe…" />,
});

// One-time feature detection via useSyncExternalStore rather than an
// effect+setState: capability never changes mid-session, so `subscribe` is
// a no-op, and getServerSnapshot keeps SSR/first-hydration-paint consistent
// (optimistic `true`) before getSnapshot corrects it on the client.
function subscribeNever() {
  return () => {};
}
function getWebglSnapshot(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}
function getServerWebglSnapshot(): boolean {
  return true;
}

export default function Travel() {
  const reducedMotion = useReducedMotionSafe();
  const sectionRef = useRef<HTMLDivElement>(null);
  // `margin` pre-triggers before the section is fully on-screen -- this is
  // what lazy-loads the globe chunk "when the travel section nears the
  // viewport" (sections 2 & 9), not only once it's already visible.
  const inView = useInView(sectionRef, { margin: "200px", once: true });
  const webglAvailable = useSyncExternalStore(
    subscribeNever,
    getWebglSnapshot,
    getServerWebglSnapshot,
  );

  const [selectedTripSlug, setSelectedTripSlug] = useState<string | null>(null);
  const selectedTrip = trips.find((t) => t.slug === selectedTripSlug) ?? null;

  return (
    <section
      id="travel"
      ref={sectionRef}
      // Wider than the other sections' max-w-5xl so a square globe has
      // horizontal room, though the globe itself is now capped well below
      // this (see max-w-lg below) so the whole section -- heading, globe,
      // legend -- fits one viewport instead of needing a scroll inside it.
      className="relative mx-auto w-full max-w-7xl px-6 py-24 sm:py-32"
    >
      <h2 data-monkey-anchor="travel" className="mb-6 font-mono text-xs uppercase tracking-wide text-ink/70">
        Travel
      </h2>

      {!webglAvailable ? (
        <GlobeFallback reason="3D globe isn't available on this device." />
      ) : inView ? (
        <TravelGlobe trips={trips} reducedMotion={reducedMotion} onSelectTrip={setSelectedTripSlug} />
      ) : (
        <GlobeFallback reason="Loading globe…" />
      )}

      {/* Always-visible instruction + legend -- a hover-only cursor swap on
          the globe itself (TravelGlobe.tsx's onPointHover) is the only
          other affordance a flat pin on a 3D surface has, and that's
          invisible on touch and unreachable by keyboard. These buttons are
          a real, independently-focusable path into each trip gallery that
          works identically on touch/desktop/keyboard, and (since they don't
          touch the canvas at all) even when WebGL isn't available. */}
      <div className="mx-auto mt-4 flex max-w-lg flex-col items-center gap-2">
        <p className="font-mono text-xs text-ink/65">
          Tap a pin on the globe, or pick a trip below.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {trips.map((trip, i) => (
            <button
              key={trip.slug}
              type="button"
              onClick={() => setSelectedTripSlug(trip.slug)}
              className="glass flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs text-ink/80 transition-transform hover:scale-[1.03]"
            >
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: TRIP_PIN_COLORS[i % TRIP_PIN_COLORS.length] }}
              />
              {trip.title}
            </button>
          ))}
        </div>
      </div>

      <TripGallery
        trip={selectedTrip}
        reducedMotion={reducedMotion}
        onClose={() => setSelectedTripSlug(null)}
      />
    </section>
  );
}
