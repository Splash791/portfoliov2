"use client";

import { useEffect, useRef } from "react";
import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Trip } from "@/data/trips";
import { durations } from "@/lib/motion";

const PIN_COLORS = ["#ff6f59", "#8c7ae6", "#f6ae2d"];

// MapLibre's default worker-URL resolution (relative to its own
// `import.meta.url`) doesn't survive Turbopack's chunk naming — the worker
// silently fails ("Worker failed to load") and the map renders a blank
// canvas with no console-visible failure beyond that one line. Pointing it
// at a copy of the same file served as a static asset sidesteps bundler
// resolution entirely. Keep public/vendor/maplibre-gl-worker.mjs in sync
// with node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs if the
// maplibre-gl dependency version changes.
setWorkerUrl("/vendor/maplibre-gl-worker.mjs");

export default function TravelMap({
  trips,
  reducedMotion,
  onSelectTrip,
}: {
  trips: Trip[];
  reducedMotion: boolean;
  onSelectTrip: (slug: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      // TODO: MapLibre's own public no-key demo style -- fine for a demo,
      // but it's default MapLibre styling, not the custom light/off-white
      // basemap section 3 calls for. Swap for a styled vector source (e.g.
      // MapTiler) + API key before launch.
      style: "https://demotiles.maplibre.org/style.json",
      center: [40, 15],
      zoom: 1.1,
      attributionControl: { compact: true },
    });

    map.scrollZoom.disable();
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    const markers: Marker[] = [];

    map.on("load", () => {
      const features = trips.flatMap((trip) => {
        const stopByName = new Map(trip.stops.map((s) => [s.name, s]));
        return trip.routes
          .map((route) => {
            const from = stopByName.get(route.from);
            const to = stopByName.get(route.to);
            if (!from || !to) return null;
            return {
              type: "Feature" as const,
              properties: {},
              geometry: {
                type: "LineString" as const,
                coordinates: [
                  [from.lng, from.lat],
                  [to.lng, to.lat],
                ],
              },
            };
          })
          .filter((f): f is NonNullable<typeof f> => f !== null);
      });

      map.addSource("routes", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
      });
      map.addLayer({
        id: "routes-line",
        type: "line",
        source: "routes",
        paint: {
          "line-color": "#8c7ae6",
          "line-width": 2,
          "line-opacity": reducedMotion ? 0.85 : 0,
        },
      });

      // Animated reveal of the route lines (section 7: "drawn on
      // scroll/hover"). The map only mounts once the Travel section nears
      // the viewport (see Travel.tsx), so "on load" here coincides with
      // "on scroll into view". Skipped under reduced motion -- the layer
      // is already painted at full opacity above.
      if (!reducedMotion) {
        const start = performance.now();
        const durationMs = durations.slow * 2000;
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          map.setPaintProperty("routes-line", "line-opacity", t * 0.85);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }

      trips.forEach((trip, ti) => {
        trip.stops.forEach((stop) => {
          const el = document.createElement("button");
          el.type = "button";
          el.setAttribute("aria-label", `${trip.title}: ${stop.name}`);
          el.style.width = "16px";
          el.style.height = "16px";
          el.style.borderRadius = "50%";
          el.style.border = "2px solid rgba(255,255,255,0.85)";
          el.style.background = PIN_COLORS[ti % PIN_COLORS.length];
          el.style.cursor = "pointer";
          el.addEventListener("click", () => onSelectTrip(trip.slug));

          markers.push(
            new Marker({ element: el }).setLngLat([stop.lng, stop.lat]).addTo(map),
          );
        });
      });
    });

    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
    };
  }, [trips, reducedMotion, onSelectTrip]);

  return (
    <div
      ref={containerRef}
      style={{ filter: "saturate(0.55) brightness(1.08) sepia(0.12)" }}
      className="h-[60vh] min-h-[360px] w-full overflow-hidden rounded-[2rem]"
    />
  );
}
