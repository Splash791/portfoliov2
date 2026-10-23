// Photo slot for About's carousel (same pattern as data/projects.ts's
// `images` field): drop files in public/portfoliov2-images/ and list them
// here as { src, alt } — PhotoCarousel renders them automatically.

import type { CarouselPhoto } from "@/components/ui/PhotoCarousel";

export type AboutPhoto = CarouselPhoto;

export const aboutPhotos: AboutPhoto[] = [
  { src: "/portfoliov2-images/portfoliov2-c1.JPG", alt: "Tyler Quach, photo 1" },
];
