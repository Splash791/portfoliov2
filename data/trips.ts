// Trip list replaced per direct instruction with the real destinations
// given in chat: Japan, New Zealand, Hong Kong + Singapore, an Alaska
// cruise, Paris, Rome, and Vietnam. Where only a country was named (Japan,
// New Zealand, Vietnam), the stop below uses that country's capital/largest
// city as a representative map point since no specific itinerary was
// given -- replace with the real stops. `status` (past vs. upcoming) was
// not specified for any of these and is defaulted to "past" below --
// correct any that are actually upcoming. Photos/notes are still open too.

export type Trip = {
  slug: string;
  title: string;
  status: "past" | "upcoming";
  stops: { name: string; lat: number; lng: number }[];
  routes: { from: string; to: string; mode: "flight" | "bus" | "train" | "boat" }[];
  photos?: { src: string; alt: string; caption?: string }[];
  notes?: string;
};

// Shared with TravelGlobe.tsx's pin colors and Travel.tsx's legend dots, so
// the two can never drift out of sync. Lives here (not in TravelGlobe.tsx)
// because that file does a top-level `import Globe from "globe.gl"`, which
// touches browser globals at module-evaluation time -- Travel.tsx can't
// import anything from it directly without defeating the `ssr: false`
// dynamic import that keeps globe.gl off the server bundle.
//
// Five colors (the full DESIGN.md warm-accent family), not three: with
// 7 trips, a shorter cycle would repeat the same pin color across trips
// that sit right next to each other in the legend -- five keeps repeats
// to a non-adjacent pair instead of every other trip.
export const TRIP_PIN_COLORS = [
  "#ff6f59", // ember coral
  "#8c7ae6", // dusk violet
  "#f6ae2d", // golden amber
  "#e8527a", // warm rose
  "#ffb88c", // soft peach
];

export const trips: Trip[] = [
  {
    slug: "japan",
    title: "Japan 2026",
    status: "past",
    stops: [
      // TODO: Tokyo used as a placeholder representative point for "Japan" —
      // no specific city/itinerary was given. Replace with the real stops.
      { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
    ],
    routes: [],
    // TODO: notes/photos not provided yet.
  },
  {
    slug: "new-zealand",
    title: "New Zealand 2026",
    status: "past",
    stops: [
      // TODO: Auckland used as a placeholder representative point for
      // "New Zealand" — no specific city/itinerary was given.
      { name: "Auckland, New Zealand", lat: -36.8485, lng: 174.7633 },
    ],
    routes: [],
    // TODO: notes/photos not provided yet.
  },
  {
    slug: "hong-kong-singapore",
    title: "Hong Kong + Singapore - 2026",
    status: "past",
    stops: [
      { name: "Hong Kong", lat: 22.3193, lng: 114.1694 },
      { name: "Singapore", lat: 1.3521, lng: 103.8198 },
    ],
    routes: [
      // A flight is the only physically sensible mode between these two —
      // not a specific itinerary claim, just geography.
      { from: "Hong Kong", to: "Singapore", mode: "flight" },
    ],
    // TODO: notes/photos not provided yet.
  },
  {
    slug: "alaska",
    title: "Alaska 2026",
    status: "past",
    // Simplified to a single pin per direct request -- no route/arc.
    stops: [{ name: "Juneau, Alaska", lat: 58.3019, lng: -134.4197 }],
    routes: [],
    // TODO: notes/photos not provided yet.
  },
  {
    slug: "paris",
    title: "Paris, France",
    status: "past",
    stops: [{ name: "Paris, France", lat: 48.8566, lng: 2.3522 }],
    routes: [],
    // TODO: notes/photos not provided yet.
  },
  {
    slug: "rome",
    title: "Rome, Italy",
    status: "past",
    stops: [{ name: "Rome, Italy", lat: 41.9028, lng: 12.4964 }],
    routes: [],
    // TODO: notes/photos not provided yet.
  },
  {
    slug: "vietnam",
    title: "Vietnam",
    status: "past",
    stops: [{ name: "Ho Chi Minh City, Vietnam", lat: 10.8231, lng: 106.6297 }],
    routes: [],
    // TODO: notes/photos not provided yet.
  },
];
