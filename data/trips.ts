// TODO(section 12): exact stops/routes/photos/notes per trip are still open
// ("Which trip photos/notes to include for each trip, and how many per
// gallery?"). Country/city names and dates below are the ones explicitly
// given in portfolio-plan.md section 7 — nothing else is invented. Where a
// trip only names a country (Japan; Australia + Vietnam), the stop below
// uses that country's capital/largest city as a representative map point
// since no specific itinerary was given — replace with the real cities.
// `routes` legs are placeholders (mode is the only physically-sensible
// choice, e.g. a flight between Australia and Vietnam) pending the real
// itinerary.

export type Trip = {
  slug: string;
  title: string;
  status: "past" | "upcoming";
  stops: { name: string; lat: number; lng: number }[];
  routes: { from: string; to: string; mode: "flight" | "bus" | "train" }[];
  photos?: { src: string; alt: string; caption?: string }[];
  notes?: string;
};

export const trips: Trip[] = [
  {
    slug: "japan",
    title: "Japan",
    // Sept 2026, per the plan — already past relative to today.
    status: "past",
    stops: [
      // TODO: Tokyo used as a placeholder representative point for "Japan" —
      // no specific city/itinerary was given. Replace with the real stops.
      { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
    ],
    routes: [],
    // TODO: notes/photos not provided yet (section 12).
  },
  {
    slug: "london",
    title: "London",
    status: "past",
    stops: [{ name: "London", lat: 51.5072, lng: -0.1276 }],
    routes: [],
    // TODO: no specific study-abroad dates given; notes/photos not provided yet.
  },
  {
    slug: "australia-vietnam",
    title: "Australia + Vietnam",
    // Dec 2026 – Jan 2027, per the plan — explicitly "upcoming".
    status: "upcoming",
    stops: [
      // TODO: Canberra/Hanoi used as placeholder representative points —
      // no specific cities/itinerary were given. Replace with the real stops.
      { name: "Canberra, Australia", lat: -35.2809, lng: 149.13 },
      { name: "Hanoi, Vietnam", lat: 21.0278, lng: 105.8342 },
    ],
    routes: [
      // A flight is the only physically sensible mode between these two
      // countries — not a specific itinerary claim, just geography.
      { from: "Canberra, Australia", to: "Hanoi, Vietnam", mode: "flight" },
    ],
    // TODO: notes/photos not provided yet (section 12).
  },
];
