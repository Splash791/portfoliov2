// Photo slot for About's carousel (same pattern as data/projects.ts's
// `images` field): drop files in public/images/about/ and list them here
// as { src, alt } — PhotoCarousel renders them automatically. Empty for
// now since no real photos exist yet (never invent/fake placeholder photo
// content); the carousel shows its own placeholder state until this has
// entries.

import type { CarouselPhoto } from "@/components/ui/PhotoCarousel";

export type AboutPhoto = CarouselPhoto;

export const aboutPhotos: AboutPhoto[] = [];
