"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useSyncExternalStore } from "react";
import { useInView } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/motion";
import { trips } from "@/data/trips";
import TripGallery from "./TripGallery";

function MapFallback() {
  return (
    <div className="glass flex h-[60vh] min-h-[360px] w-full items-center justify-center rounded-[2rem]">
      <p className="font-mono text-xs text-ink/65">Loading map…</p>
    </div>
  );
}

// Both touch browser globals (canvas/WebGL, maplibre-gl's module-load-time
// feature checks) -- dynamically imported with no SSR, mirroring section
// 2's explicit "no SSR" instruction for the r3f globe.
const TravelMap = dynamic(() => import("./TravelMap"), {
  ssr: false,
  loading: () => <MapFallback />,
});
const TravelGlobe = dynamic(() => import("./TravelGlobe"), {
  ssr: false,
  loading: () => <MapFallback />,
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
  // what lazy-loads the map/globe chunk "when the travel section nears the
  // viewport" (sections 2 & 9), not only once it's already visible.
  const inView = useInView(sectionRef, { margin: "200px", once: true });
  const webglAvailable = useSyncExternalStore(
    subscribeNever,
    getWebglSnapshot,
    getServerWebglSnapshot,
  );

  const [view, setView] = useState<"map" | "globe">("map");
  const [selectedTripSlug, setSelectedTripSlug] = useState<string | null>(null);
  const selectedTrip = trips.find((t) => t.slug === selectedTripSlug) ?? null;

  const showGlobe = view === "globe" && webglAvailable;

  return (
    <section
      id="travel"
      ref={sectionRef}
      className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:py-32"
    >
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-mono text-xs uppercase tracking-wide text-ink/70">Travel</h2>

        {/* Default view is the flat map (lighter option per section 3);
            the globe is an opt-in toggle, hidden entirely when WebGL isn't
            available so the toggle never leads to a broken canvas. */}
        {webglAvailable && (
          <div className="glass flex rounded-full p-1">
            <button
              type="button"
              onClick={() => setView("map")}
              aria-pressed={view === "map"}
              className={`rounded-full px-4 py-1.5 font-mono text-xs transition-colors ${
                view === "map" ? "bg-ink text-[var(--color-base)]" : "text-ink/75"
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setView("globe")}
              aria-pressed={view === "globe"}
              className={`rounded-full px-4 py-1.5 font-mono text-xs transition-colors ${
                view === "globe" ? "bg-ink text-[var(--color-base)]" : "text-ink/75"
              }`}
            >
              Globe
            </button>
          </div>
        )}
      </div>

      {inView ? (
        showGlobe ? (
          <TravelGlobe trips={trips} reducedMotion={reducedMotion} onSelectTrip={setSelectedTripSlug} />
        ) : (
          <TravelMap trips={trips} reducedMotion={reducedMotion} onSelectTrip={setSelectedTripSlug} />
        )
      ) : (
        <MapFallback />
      )}

      <TripGallery
        trip={selectedTrip}
        reducedMotion={reducedMotion}
        onClose={() => setSelectedTripSlug(null)}
      />
    </section>
  );
}
