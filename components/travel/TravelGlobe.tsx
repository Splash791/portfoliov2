"use client";

import { useEffect, useRef } from "react";
import Globe, { type GlobeInstance } from "globe.gl";
import { TRIP_PIN_COLORS, type Trip } from "@/data/trips";

// Default export only (dynamically imported with { ssr: false } from
// Travel.tsx) -- this file must never run on the server.

const ARC_COLOR = "#3a2c1e"; // espresso, matching --color-sage
// Shared between `.arcAltitudeAutoScale()` (reduced-motion's static arcs)
// and each animated leg's precomputed fixed altitude, so both read as the
// same arc height.
const ARC_ALTITUDE_AUTO_SCALE = 0.3;

type GlobePoint = { lat: number; lng: number; color: string; tripSlug: string };
// `altitude`, when present, is a fixed per-leg height computed once from
// the leg's full endpoints (see `angularDistance` below) -- a progressively
// revealed arc's own *current* endpoint keeps moving, so letting
// `arcAltitudeAutoScale` compute height from that shrinking/growing
// distance would make the arc visibly change curvature as it draws in.
// Static (reduced-motion, and any non-flight route) arcs omit it and fall
// back to auto-scale.
type GlobeArc = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  altitude?: number;
};
// Mutated in place every tick rather than replaced -- the html-elements
// layer re-identifies the same bound object across calls and smoothly
// tweens its existing marker to the new lat/lng instead of recreating it.
type GlobeRouteIcon = { lat: number; lng: number };
type Waypoint = { lat: number; lng: number };

// How long one full pass across a trip's legs takes to glide, in ms.
// Slowed down considerably (was 3500) per direct request.
const LEG_DURATION_MS = 12000;

// Only flight routes get the animated icon + progressive trail treatment,
// per direct request -- a plane graphic, not a generic travel-mode icon
// set. Adapted from Material Symbols (Apache-2.0), a real icon library:
// a solid filled silhouette reads as an actual plane pictogram at a
// glance, at small size, which a thin outline didn't. `currentColor` so
// the badge wrapper's `text-ink` class drives the fill.
const PLANE_ICON_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M21 16.5V15L13 10V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V10L2 15V16.5L10 13.9V19L7.5 20.5V21.5L11.5 20.5L15.5 21.5V20.5L13 19V13.9L21 16.5Z"/></svg>`;

function createPlaneIconElement(): HTMLElement {
  const el = document.createElement("div");
  // `.glass` badge, same frosted treatment as every other elevated surface
  // on the site -- gives the icon contrast against whatever terrain color
  // sits behind it on the photographic texture, land or ocean.
  el.className = "glass flex h-7 w-7 items-center justify-center rounded-full text-ink";
  el.innerHTML = PLANE_ICON_SVG;
  return el;
}

// Angular (great-circle) distance between two points, in radians -- the
// same quantity three-globe's own `arcAltitudeAutoScale` multiplies to get
// an arc's height (see `geoDistance` usage in its `calcCurve`). Exposed
// separately so a leg's *fixed* altitude (computed once from its true
// endpoints) can be reused every frame, instead of auto-scale recomputing
// a shrinking/growing height from a progressively-revealed arc's moving
// current endpoint.
function angularDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = Math.PI / 180;
  const phi1 = lat1 * toRad;
  const phi2 = lat2 * toRad;
  const deltaPhi = (lat2 - lat1) * toRad;
  const deltaLambda = (lng2 - lng1) * toRad;
  const a =
    Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Point a fraction `f` (0=point 1, 1=point 2, 0.5=midpoint) along the
// great-circle path between two points (spherical interpolation), not a
// naive lat/lng average -- a straight average visibly cuts the corner on
// long routes (e.g. Hong Kong to Singapore spans real curvature). Standard
// intermediate-point-on-a-great-circle formula; used both for the one-shot
// reduced-motion badge (f=0.5) and, every animation frame, to glide the
// marker smoothly along the actual curved path a leg's arc draws, not in
// straight-line jumps between its two endpoints.
function sphericalInterpolate(lat1: number, lng1: number, lat2: number, lng2: number, f: number) {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  const phi1 = lat1 * toRad;
  const lambda1 = lng1 * toRad;
  const phi2 = lat2 * toRad;
  const lambda2 = lng2 * toRad;
  const delta = angularDistance(lat1, lng1, lat2, lng2);
  if (delta === 0) return { lat: lat1, lng: lng1 };
  const A = Math.sin((1 - f) * delta) / Math.sin(delta);
  const B = Math.sin(f * delta) / Math.sin(delta);
  const x = A * Math.cos(phi1) * Math.cos(lambda1) + B * Math.cos(phi2) * Math.cos(lambda2);
  const y = A * Math.cos(phi1) * Math.sin(lambda1) + B * Math.cos(phi2) * Math.sin(lambda2);
  const z = A * Math.sin(phi1) + B * Math.sin(phi2);
  const phi3 = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lambda3 = Math.atan2(y, x);
  return { lat: phi3 * toDeg, lng: lambda3 * toDeg };
}

// The ordered sequence of points a trip's icon travels through, built from
// its routes (not `stops`, which may not match visiting order) -- route 0's
// `from` is the start, then each route's `to` in turn. Returns null for a
// trip with no routes (nothing to animate).
function buildTripWaypoints(trip: Trip): { waypoints: Waypoint[]; mode: Trip["routes"][number]["mode"] } | null {
  if (trip.routes.length === 0) return null;
  const stopByName = new Map(trip.stops.map((s) => [s.name, s]));
  const first = stopByName.get(trip.routes[0].from);
  if (!first) return null;
  const waypoints: Waypoint[] = [{ lat: first.lat, lng: first.lng }];
  for (const route of trip.routes) {
    const to = stopByName.get(route.to);
    if (!to) return null;
    waypoints.push({ lat: to.lat, lng: to.lng });
  }
  return { waypoints, mode: trip.routes[0].mode };
}

function legAltitudesFor(waypoints: Waypoint[]): number[] {
  return waypoints.slice(0, -1).map((wp, i) => {
    const next = waypoints[i + 1];
    return (angularDistance(wp.lat, wp.lng, next.lat, next.lng) / 2) * ARC_ALTITUDE_AUTO_SCALE;
  });
}

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

    // Only a flight route animates (icon + progressive trail, below). Any
    // other mode (currently: the Alaska cruise's boat legs) still renders
    // its route, just as a plain, always-fully-drawn static line with no
    // moving icon -- collected here once, up front, since it never changes
    // frame to frame.
    const staticArcs: GlobeArc[] = [];

    // One icon per flight trip, travelling that trip's full sequence of
    // legs (so a multi-leg flight itinerary reads as one aircraft visiting
    // stops in order, not several static badges). For an open route (not a
    // loop back to its own start -- the only kind flight data has right
    // now), reaching the end doesn't retrace the same line backward: the
    // trail disappears and regenerates from the opposite end, by swapping
    // which of `forwardWaypoints`/`reverseWaypoints` is active and
    // resetting `t` to 0 rather than letting it run back down through the
    // same leg. `t` itself only ever increases within a pass.
    type AnimatedIcon = {
      data: GlobeRouteIcon;
      forwardWaypoints: Waypoint[];
      reverseWaypoints: Waypoint[];
      forwardLegAltitudes: number[];
      reverseLegAltitudes: number[];
      active: "forward" | "reverse";
      t: number;
      // A route chain that loops back to its own start (last waypoint ===
      // first) wraps forward through `forwardWaypoints` forever instead of
      // ever flipping to reverse -- not exercised by current data (no
      // flight route closes a loop), kept correct for if one ever does.
      closed: boolean;
      legAltitudes: number[];
    };
    const animatedIcons: AnimatedIcon[] = [];
    const staticIcons: GlobeRouteIcon[] = [];

    trips.forEach((trip) => {
      const built = buildTripWaypoints(trip);
      if (!built) return;
      const { waypoints, mode } = built;

      if (mode !== "flight") {
        for (let i = 0; i < waypoints.length - 1; i++) {
          const a = waypoints[i];
          const b = waypoints[i + 1];
          staticArcs.push({ startLat: a.lat, startLng: a.lng, endLat: b.lat, endLng: b.lng });
        }
        return;
      }

      if (reducedMotion) {
        // No per-frame motion at all under reduced motion -- the full
        // route is drawn immediately, plus a single static badge at the
        // first leg's midpoint, with nothing moving on its own.
        for (let i = 0; i < waypoints.length - 1; i++) {
          const a = waypoints[i];
          const b = waypoints[i + 1];
          staticArcs.push({ startLat: a.lat, startLng: a.lng, endLat: b.lat, endLng: b.lng });
        }
        const [a, b] = waypoints;
        const mid = sphericalInterpolate(a.lat, a.lng, b.lat, b.lng, 0.5);
        staticIcons.push({ lat: mid.lat, lng: mid.lng });
        return;
      }

      const first = waypoints[0];
      const last = waypoints[waypoints.length - 1];
      const closed =
        waypoints.length > 2 && first.lat === last.lat && first.lng === last.lng;
      const forwardLegAltitudes = legAltitudesFor(waypoints);
      const reverseWaypoints = [...waypoints].reverse();
      animatedIcons.push({
        data: { lat: first.lat, lng: first.lng },
        forwardWaypoints: waypoints,
        reverseWaypoints,
        forwardLegAltitudes,
        reverseLegAltitudes: [...forwardLegAltitudes].reverse(),
        active: "forward",
        t: 0,
        closed,
        legAltitudes: forwardLegAltitudes,
      });
    });

    const routeIcons: GlobeRouteIcon[] = reducedMotion
      ? staticIcons
      : animatedIcons.map((icon) => icon.data);

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
      .arcsData(staticArcs)
      .arcColor(() => ARC_COLOR)
      .arcStroke(0.4)
      // Static arcs (reduced-motion, and any non-flight route) have no
      // `altitude` field and fall through to auto-scale; animated flight
      // arcs carry their leg's precomputed fixed altitude (see
      // `GlobeArc.altitude`'s comment) and use that instead, so both read
      // as the same consistent arc height.
      .arcAltitude((d) => (d as GlobeArc).altitude ?? null)
      .arcAltitudeAutoScale(ARC_ALTITUDE_AUTO_SCALE)
      // Progressive reveal (below) is the flight route's own animation, not
      // a decorative flowing dash on top of an already-fully-drawn line --
      // solid strokes in every case.
      .arcDashLength(1)
      .arcDashGap(0)
      // Plane icon badge per flight trip, billboarded via globe.gl's HTML
      // elements layer -- a real DOM element, not a WebGL sprite, so it
      // stays crisp and readable at any zoom instead of a texture that
      // pixelates up close. `htmlTransitionDuration(0)`: under motion, the
      // rAF loop below already drives smooth continuous movement itself
      // (one `sphericalInterpolate` call per frame) -- the library's own
      // built-in tweening would just fight it, re-tweening a fresh tiny
      // step every frame instead of landing exactly where asked.
      .htmlElementsData(routeIcons)
      .htmlLat("lat")
      .htmlLng("lng")
      .htmlAltitude(0.02)
      .htmlElement(() => createPlaneIconElement())
      .htmlTransitionDuration(0);

    // Glide each flight icon continuously along its actual curved great-
    // circle path, progressively drawing that leg's arc in behind it as it
    // goes. On reaching the end of an open route, the trail disappears and
    // regenerates from the opposite end (see `AnimatedIcon`'s comment)
    // rather than retracing itself backward.
    let rafId: number | undefined;
    let lastFrameTime: number | undefined;
    if (!reducedMotion && animatedIcons.length > 0) {
      const tick = (now: number) => {
        const deltaMs = lastFrameTime === undefined ? 0 : now - lastFrameTime;
        lastFrameTime = now;

        for (const icon of animatedIcons) {
          let waypoints = icon.active === "forward" ? icon.forwardWaypoints : icon.reverseWaypoints;
          let legAltitudes =
            icon.active === "forward" ? icon.forwardLegAltitudes : icon.reverseLegAltitudes;
          let legCount = waypoints.length - 1;

          icon.t += deltaMs / LEG_DURATION_MS;

          if (icon.closed) {
            // `legCount` excludes the duplicate closing waypoint, so
            // wrapping past it continues straight into the real waypoint 0
            // again instead of visibly pausing on a repeated point.
            if (icon.t >= legCount) icon.t -= legCount;
          } else if (icon.t >= legCount) {
            // End of this pass: disappear and start a fresh pass from the
            // opposite end, instead of reversing back through the same
            // (now fully-drawn) line.
            icon.active = icon.active === "forward" ? "reverse" : "forward";
            icon.t = 0;
            waypoints = icon.active === "forward" ? icon.forwardWaypoints : icon.reverseWaypoints;
            legAltitudes =
              icon.active === "forward" ? icon.forwardLegAltitudes : icon.reverseLegAltitudes;
            legCount = waypoints.length - 1;
          }

          const legIndex = Math.min(Math.floor(icon.t), Math.max(legCount - 1, 0));
          const legFrac = icon.t - legIndex;
          const from = waypoints[legIndex];
          const to = waypoints[legIndex + 1];
          const pos = sphericalInterpolate(from.lat, from.lng, to.lat, to.lng, legFrac);
          icon.data.lat = pos.lat;
          icon.data.lng = pos.lng;
          icon.legAltitudes = legAltitudes;
        }
        // Re-invoking the setter (same array/object references, just
        // mutated) is what re-triggers globe.gl's digest and applies the
        // new position -- it isn't gated on the array reference changing.
        globe.htmlElementsData(routeIcons);

        // Rebuild every leg's progressively-revealed arc from the same `t`
        // (and active direction) each icon just advanced to:
        // `clamp(t - i, 0, 1)` is each leg i's 0-1 reveal fraction within
        // the current pass -- it resets to all-zero the instant a pass
        // flips (the active waypoint list just changed), giving the
        // disappear-and-regenerate behavior with no separate bookkeeping.
        const animatedArcs: GlobeArc[] = animatedIcons.flatMap((icon) => {
          const waypoints = icon.active === "forward" ? icon.forwardWaypoints : icon.reverseWaypoints;
          const legCount = waypoints.length - 1;
          const segments: GlobeArc[] = [];
          for (let i = 0; i < legCount; i++) {
            const progress = Math.min(Math.max(icon.t - i, 0), 1);
            if (progress <= 0) continue;
            const from = waypoints[i];
            const to = waypoints[i + 1];
            const end =
              progress >= 1 ? to : sphericalInterpolate(from.lat, from.lng, to.lat, to.lng, progress);
            segments.push({
              startLat: from.lat,
              startLng: from.lng,
              endLat: end.lat,
              endLng: end.lng,
              altitude: icon.legAltitudes[i],
            });
          }
          return segments;
        });
        globe.arcsData([...staticArcs, ...animatedArcs]);

        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
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
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      globe._destructor();
      container.replaceChildren();
    };
  }, [trips, reducedMotion]);

  return (
    <div
      ref={containerRef}
      // Width-driven, not a guessed rem/dvh constant: `calc(100dvh - <rest
      // of the section's own height>)` is the actual leftover vertical
      // room once the section's own py-24/sm:py-32 padding, heading, and
      // trip legend are accounted for -- so the globe (via `aspect-square`
      // deriving height from this width) grows to fill exactly what's left
      // of one screen, no more, no less, instead of a size picked by eye.
      // The subtracted amount is a deliberately slightly-generous estimate
      // of that fixed overhead (mobile: ~22rem of py-24 + heading + a
      // legend that may wrap to two lines; sm+: ~24rem for py-32's larger
      // padding) -- generous so real content/line-wrapping variance still
      // fits, at the cost of a few px of otherwise-available globe size.
      // `100%` stays as the mobile container-width backstop.
      className="mx-auto aspect-square w-[min(calc(100dvh-22rem),100%)] overflow-hidden rounded-[2rem] sm:w-[min(calc(100dvh-24rem),100%)]"
    />
  );
}
