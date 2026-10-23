// Trip list replaced per direct instruction with the real destinations
// given in chat: Japan, New Zealand, Hong Kong + Singapore, Alaska, a 2018
// Europe trip (Paris -> Venice, one-way flight), and Vietnam. Where only a
// country was named (Japan, New Zealand), the stop below uses that
// country's capital/largest city as a representative map point since no
// specific itinerary was given -- replace with the real stops. `status`
// (past vs. upcoming) was not specified for any of these and is defaulted
// to "past" below -- correct any that are actually upcoming. Photos/notes
// are still open too.

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
  "#8c6b42", // tan
  "#3a2c1e", // espresso
  "#b89968", // khaki
  "#5e4830", // umber
  "#ddd0b0", // cream
];

export const trips: Trip[] = [
  {
    slug: "japan",
    title: "Japan - 2026",
    status: "past",
    stops: [
      // TODO: Tokyo used as a placeholder representative point for "Japan" —
      // no specific city/itinerary was given. Replace with the real stops.
      { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
    ],
    routes: [],
    photos: [
      { src: "/portfoliov2-images/portfoliov2-jp1.JPG", alt: "Japan, photo 1" },
      { src: "/portfoliov2-images/portfoliov2-jp2.JPG", alt: "Japan, photo 2" },
      { src: "/portfoliov2-images/portfoliov2-jp3.JPG", alt: "Japan, photo 3" },
    ],
    notes: "Post internship trip. It was a dream of mine to travel to Japan as a kid due to the culture and automotive scene. I was able to see one of my dream cars (Nissan S15).",
  },
  {
    slug: "new-zealand",
    title: "New Zealand - 2026",
    status: "past",
    stops: [
      // TODO: Auckland used as a placeholder representative point for
      // "New Zealand" — no specific city/itinerary was given.
      { name: "Auckland, New Zealand", lat: -36.8485, lng: 174.7633 },
    ],
    routes: [],
    photos: [
      { src: "/portfoliov2-images/portfoliov2-nz1.JPG", alt: "New Zealand, photo 1" },
      { src: "/portfoliov2-images/portfoliov2-nz2.JPG", alt: "New Zealand, photo 2" },
      { src: "/portfoliov2-images/portfoliov2-nz3.JPG", alt: "New Zealand, photo 3" },
    ],
    notes: "This was a spontaneous 10 day trip. I booked the flight 4 days before the departure date and it was my first time backpacking.",
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
    photos: [
      { src: "/portfoliov2-images/portfoliov2-hk1.JPG", alt: "Hong Kong, photo 1" },
      { src: "/portfoliov2-images/portfoliov2-hk2.JPG", alt: "Hong Kong, photo 2" },
      { src: "/portfoliov2-images/portfoliov2-sg1.JPG", alt: "Singapore, photo 1" },
      { src: "/portfoliov2-images/portfoliov2-sg2.JPG", alt: "Singapore, photo 2" },
    ],
    notes: "After seeing these places in movies such as Crazy Rich Asians and Rush Hour 2, it was surreal to finally see it in person.",
  },
  {
    slug: "alaska",
    title: "Alaska - 2026",
    status: "past",
    // Simplified to a single pin per direct request -- no route/arc.
    stops: [{ name: "Juneau, Alaska", lat: 58.3019, lng: -134.4197 }],
    routes: [],
    photos: [
      { src: "/portfoliov2-images/portfoliov2-ak1.JPG", alt: "Alaska, photo 1" },
      { src: "/portfoliov2-images/portfoliov2-ak2.JPG", alt: "Alaska, photo 2" },
    ],
    notes: "Reconnected with nature.",
  },
  {
    slug: "europe-2018",
    title: "France + Italy - 2018",
    status: "past",
    stops: [
      { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
      { name: "Venice, Italy", lat: 45.4408, lng: 12.3155 },
    ],
    routes: [{ from: "Paris, France", to: "Venice, Italy", mode: "flight" }],
    photos: [
      { src: "/portfoliov2-images/portfoliov2-eu1.jpeg", alt: "Europe 2018, photo 1" },
      { src: "/portfoliov2-images/portfoliov2-eu2.jpg", alt: "Europe 2018, photo 2" },
      { src: "/portfoliov2-images/portfoliov2-eu3.jpg", alt: "Europe 2018, photo 3" },
      { src: "/portfoliov2-images/portfoliov2-eu4.jpg", alt: "Europe 2018, photo 4" },
    ],
    notes: "Paris -> Venice -> Rome.",
  },
  {
    slug: "vietnam",
    title: "Vietnam - 2023",
    status: "past",
    stops: [{ name: "Ho Chi Minh City, Vietnam", lat: 10.8231, lng: 106.6297 }],
    routes: [],
    photos: [
      { src: "/portfoliov2-images/portfoliov2-vn1.JPG", alt: "Vietnam, photo 1" },
      { src: "/portfoliov2-images/portfoliov2-vn2.JPG", alt: "Vietnam, photo 2" },
      { src: "/portfoliov2-images/portfoliov2-vn3.JPG", alt: "Vietnam, photo 3" },
    ],
    notes: "High school grad trip. I was able to reconnect with my roots and explore so much of the country from North to South.",
  },
];
