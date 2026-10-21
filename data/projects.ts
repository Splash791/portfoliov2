// TODO: every `summary` below is placeholder "problem + approach" copy per
// section 0's template style — no specific facts, tech stacks, metrics, or
// URLs are invented. `stack`/`links`/cover/video/screenshots/architecture/
// metrics are left empty or undefined until real assets exist (section 11).
//
// To add project images: drop files in public/images/projects/ and either:
//   - set `images: [{ src: "/images/projects/<file>", alt: "..." }, ...]`
//     for multiple -- the card shows them as a carousel (prev/next + dots),
//   - or set just `cover: "/images/projects/<file>"` for a single static
//     image (no carousel chrome).
// ProjectCard renders either automatically, no code changes needed. `images`
// takes priority over `cover` if both are set. Projects with neither keep
// the generated-gradient fallback so the grid stays uniform.

export type Project = {
  slug: string;
  title: string;
  summary: string; // summary = problem + approach
  stack: string[];
  links: { github?: string; demo?: string; devpost?: string };
  cover?: string; // single static image; falls back to a generated gradient when absent
  images?: { src: string; alt: string }[]; // multiple images -> rendered as a carousel, takes priority over `cover`
  video?: string;
  screenshots?: string[];
  architecture?: string;
  metrics?: { label: string; value: string }[];
  demoEmbed?: string; // reserved for later live demos (not v1)
  featured?: boolean; // renders as the larger bento tile in the grid
  placeholder?: boolean; // marks a generic, not-yet-written-up card so it reads as "in progress", not abandoned
};

// Order = importance (FarmOS first, per direct instruction), not chronology.
export const projects: Project[] = [
  {
    slug: "farmos",
    title: "FarmOS",
    // Real fact (user-provided, not a placeholder): FarmOS won the Gemini
    // track at QuackHack. Everything else about this project is still
    // generic placeholder, same as the rest of this file — no other
    // specifics were given, so none are invented.
    summary:
      "A farm-management dashboard — won the Gemini track at QuackHack. The rest of the write-up (problem detail, approach, stack) is still TODO.",
    stack: [],
    links: {},
    metrics: [{ label: "QuackHack", value: "Gemini track winner" }],
    featured: true,
  },
  {
    slug: "ai-hallucination-detector",
    title: "AI Hallucination Detector",
    summary:
      "Project summary goes here, 2-3 sentences: the problem is flagging unreliable or fabricated output from language models, and the approach taken to detect it. Replace with the real write-up.",
    stack: [],
    links: {},
    placeholder: true,
  },
  {
    slug: "aerosearch",
    title: "AeroSearch",
    summary:
      "Project summary goes here, 2-3 sentences on the problem this search tool addresses and how it was built. Replace with the real write-up.",
    stack: [],
    links: {},
    placeholder: true,
  },
  {
    slug: "ocr-expense-tracker",
    title: "OCR Expense Tracker",
    summary:
      "Project summary goes here, 2-3 sentences on how receipts are read via OCR and turned into tracked expenses. Replace with the real write-up.",
    stack: [],
    links: {},
    placeholder: true,
  },
];
