"use client";

import { useEffect, useRef } from "react";
import Globe, { type GlobeInstance } from "globe.gl";
import * as THREE from "three";
import type { Trip } from "@/data/trips";

// Default export only (dynamically imported with { ssr: false } from
// Travel.tsx) -- this file must never run on the server.

const PIN_COLORS = ["#ff6f59", "#8c7ae6", "#f6ae2d"];
const ARC_COLOR = "#8c7ae6";

type GlobePoint = { lat: number; lng: number; color: string; tripSlug: string };
type GlobeArc = { startLat: number; startLng: number; endLat: number; endLng: number };

export default function TravelGlobe({
  trips,
  reducedMotion,
  onSelectTrip,
}: {
  trips: Trip[];
  reducedMotion: boolean;
  onSelectTrip: (slug: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep the latest callback in a ref so the mount effect below (which
  // should only re-run when trips/reducedMotion actually change, not on
  // every parent re-render) always calls the current onSelectTrip without
  // needing it in its dependency array.
  const onSelectTripRef = useRef(onSelectTrip);
  useEffect(() => {
    onSelectTripRef.current = onSelectTrip;
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const points: GlobePoint[] = trips.flatMap((trip, ti) =>
      trip.stops.map((stop) => ({
        lat: stop.lat,
        lng: stop.lng,
        color: PIN_COLORS[ti % PIN_COLORS.length],
        tripSlug: trip.slug,
      })),
    );

    const arcs: GlobeArc[] = trips.flatMap((trip) => {
      const stopByName = new Map(trip.stops.map((s) => [s.name, s]));
      return trip.routes.flatMap((route) => {
        const from = stopByName.get(route.from);
        const to = stopByName.get(route.to);
        if (!from || !to) return [];
        return [{ startLat: from.lat, startLng: from.lng, endLat: to.lat, endLng: to.lng }];
      });
    });

    const globe: GlobeInstance = new Globe(container, {
      rendererConfig: { alpha: true, antialias: true },
    });

    // Cap device pixel ratio -- same mobile-perf budget the previous r3f
    // Canvas enforced via `dpr={[1, 1.5]}`.
    globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    globe
      .backgroundColor("rgba(0,0,0,0)")
      // No real-earth texture is available or being fetched (section 11) --
      // a solid stylized material in the existing ink token, matching the
      // previous abstract-sphere look, not a default textured earth.
      .globeMaterial(
        new THREE.MeshStandardMaterial({ color: "#1e1b4b", roughness: 0.9, metalness: 0.1 }),
      )
      .showAtmosphere(true)
      .atmosphereColor(ARC_COLOR)
      .atmosphereAltitude(0.18)
      .pointsData(points)
      .pointLat("lat")
      .pointLng("lng")
      .pointColor("color")
      .pointAltitude(0.015)
      .pointRadius(0.4)
      .onPointClick((point) => onSelectTripRef.current((point as GlobePoint).tripSlug))
      .arcsData(arcs)
      .arcColor(() => ARC_COLOR)
      .arcStroke(0.4)
      .arcAltitudeAutoScale(0.3);

    if (reducedMotion) {
      // Fully-formed static arcs, no dash-flow animation -- matches the
      // rest of the site's "simple fades remain, nothing else" rule.
      globe.arcDashLength(1).arcDashGap(0);
    } else {
      // globe.gl's idiom for an "animated" arc is a continuously flowing
      // dash rather than the previous r3f version's one-time progressive
      // draw-in -- same spirit ("animated route arcs"), this library's
      // native pattern for it instead of hand-rolling the old approach.
      globe
        .arcDashLength(0.4)
        .arcDashGap(0.25)
        .arcDashInitialGap(() => Math.random())
        .arcDashAnimateTime(2500);
    }

    // Most trip stops (Tokyo, Canberra, Hanoi) cluster in the Eastern
    // hemisphere; the globe's default forward-facing point of view would
    // otherwise show zero pins until the user manually orbits it (a real
    // issue found during QA on the previous r3f globe) -- frame that
    // cluster on load instead. `0` transition ms = immediate, not animated.
    globe.pointOfView({ lat: 10, lng: 120, altitude: 2.2 }, 0);

    const controls = globe.controls();
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.6;
    controls.enableZoom = true;

    const resize = () => {
      globe.width(container.clientWidth).height(container.clientHeight);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      globe._destructor();
      container.replaceChildren();
    };
  }, [trips, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="h-[60vh] min-h-[360px] w-full overflow-hidden rounded-[2rem]"
    />
  );
}
