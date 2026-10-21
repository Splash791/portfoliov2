"use client";

import { useEffect, useRef } from "react";
import Globe, { type GlobeInstance } from "globe.gl";
import { TRIP_PIN_COLORS, type Trip } from "@/data/trips";

// Default export only (dynamically imported with { ssr: false } from
// Travel.tsx) -- this file must never run on the server.

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
        color: TRIP_PIN_COLORS[ti % TRIP_PIN_COLORS.length],
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
      // Life-like Earth (user asked specifically for this, after an
      // earlier dark-stylized-only pass read as too flat/abstract): a true-
      // color day-lit photo texture plus a topology bump map for visible
      // terrain relief (mountains/ridges actually catch the light instead
      // of a flat-shaded sphere). Both vendored into /public (244KB + 378KB)
      // rather than fetched from a CDN at runtime, same pattern as the
      // MapLibre worker fix earlier in this project.
      .globeImageUrl("/vendor/earth-day.jpg")
      .bumpImageUrl("/vendor/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor(ARC_COLOR)
      .atmosphereAltitude(0.18)
      .pointsData(points)
      .pointLat("lat")
      .pointLng("lng")
      .pointColor("color")
      .pointAltitude(0.015)
      // Bigger hit target per direct request -- pointRadius drives both the
      // rendered marker size and its raycast click area together, so this
      // makes pins both easier to see and easier to actually hit (was 0.4).
      .pointRadius(0.9)
      .onPointClick((point) => onSelectTripRef.current((point as GlobePoint).tripSlug))
      .onPointHover((point) => {
        // Pointer cursor on hover -- the only other affordance a flat 2D
        // marker on a 3D surface has for "this is clickable."
        container.style.cursor = point ? "pointer" : "grab";
      })
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
    // Altitude 2.6 (up from 2.2): a touch further out, leaving visible
    // padding around the sphere by default rather than it nearly touching
    // the container edges.
    globe.pointOfView({ lat: 10, lng: 120, altitude: 2.6 }, 0);

    const controls = globe.controls();
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.6;
    // Zoom locked entirely per direct request, after two rounds of the
    // sphere clipping past its container at various zoom levels (fixed via
    // distance clamping, then a square container) -- disabling scroll/pinch
    // zoom outright removes that whole failure class rather than continuing
    // to tune a range. Orbit (drag-to-rotate) stays enabled.
    controls.enableZoom = false;

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
      // A single `w-[min(...)]` expression, not separate max-w/max-h: that
      // earlier version let max-h bind tighter than max-w on most screens,
      // quietly rendering a visibly smaller globe than the max-w alone
      // implied. Sizing off one value (and letting `aspect-square` derive
      // height from it) keeps the box an actual square always, bounded by
      // whichever of "91.2rem", "112dvh" (1.6x the prior 57rem/70dvh, per
      // direct request -- note 112dvh exceeds a full viewport, so the
      // height term no longer actually limits anything; container width
      // or the 91.2rem cap is what binds now), or "100%" is smallest.
      className="mx-auto aspect-square w-[min(91.2rem,112dvh,100%)] overflow-hidden rounded-[2rem]"
    />
  );
}
