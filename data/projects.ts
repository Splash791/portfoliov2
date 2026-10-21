// TODO: every `summary` below is placeholder "problem + approach" copy per
// section 0's template style — no specific facts, tech stacks, metrics, or
// URLs are invented. `stack`/`links`/cover/video/screenshots/architecture/
// metrics are left empty or undefined until real assets exist (section 11).
//
// To add a project image: drop the file in public/images/projects/ and set
// `cover: "/images/projects/<filename>"` on that project below — ProjectCard
// renders it automatically (no code changes needed). Projects without a
// `cover` keep the generated-gradient fallback so the grid stays uniform.

export type Project = {
  slug: string;
  title: string;
  summary: string; // summary = problem + approach
  stack: string[];
  links: { github?: string; demo?: string };
  cover?: string; // falls back to a generated gradient when absent
  video?: string;
  screenshots?: string[];
  architecture?: string;
  metrics?: { label: string; value: string }[];
  demoEmbed?: string; // reserved for later live demos (not v1)
  featured?: boolean; // renders as the larger bento tile in the grid
};

export const projects: Project[] = [
  {
    slug: "ai-hallucination-detector",
    title: "AI Hallucination Detector",
    summary:
      "Project summary goes here, 2-3 sentences: the problem is flagging unreliable or fabricated output from language models, and the approach taken to detect it. Replace with the real write-up.",
    stack: [],
    links: {},
  },
  {
    slug: "aerosearch",
    title: "AeroSearch",
    summary:
      "Project summary goes here, 2-3 sentences on the problem this search tool addresses and how it was built. Replace with the real write-up.",
    stack: [],
    links: {},
  },
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
    slug: "ocr-expense-tracker",
    title: "OCR Expense Tracker",
    summary:
      "Project summary goes here, 2-3 sentences on how receipts are read via OCR and turned into tracked expenses. Replace with the real write-up.",
    stack: [],
    links: {},
  },
];
