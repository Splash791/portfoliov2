// Photo slot for About's carousel (same pattern as data/projects.ts's
// `cover` field): drop files in public/images/about/ and list them here as
// { src, alt } — PhotoCarousel renders them automatically. Empty for now
// since no real casual photos exist yet (never invent/fake placeholder
// photo content); the carousel shows its own placeholder state until this
// has entries.

export type AboutPhoto = {
  src: string;
  alt: string;
};

export const aboutPhotos: AboutPhoto[] = [];
