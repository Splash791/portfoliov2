"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useSyncExternalStore } from "react";
import { useInView } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/motion";
import { trips } from "@/data/trips";
import TripGallery from "./TripGallery";

function GlobeFallback({ reason }: { reason: string }) {
  return (
    <div className="glass mx-auto flex aspect-square w-full max-w-3xl items-center justify-center rounded-[2rem]">
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
      className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:py-32"
    >
      <h2 className="mb-10 font-mono text-xs uppercase tracking-wide text-ink/70">Travel</h2>

      {!webglAvailable ? (
        <GlobeFallback reason="3D globe isn't available on this device." />
      ) : inView ? (
        <TravelGlobe trips={trips} reducedMotion={reducedMotion} onSelectTrip={setSelectedTripSlug} />
      ) : (
        <GlobeFallback reason="Loading globe…" />
      )}

      <TripGallery
        trip={selectedTrip}
        reducedMotion={reducedMotion}
        onClose={() => setSelectedTripSlug(null)}
      />
    </section>
  );
}
