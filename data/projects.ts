// All four projects' summary/details/stack are real, user-provided facts
// (no `placeholder: true` entries remain). None of them have a real
// `links.github`/`demo`/`devpost` URL yet -- left unset rather than
// invented; add the real ones when available (plan section 11).
//
// Project images live in public/portfoliov2-images/ (same folder as the
// travel photos) -- either:
//   - set `images: [{ src: "/portfoliov2-images/<file>", alt: "..." }, ...]`
//     for multiple -- the card shows them as a carousel (prev/next + dots),
//   - or set just `cover: "/portfoliov2-images/<file>"` for a single static
//     image (no carousel chrome).
// ProjectCard renders either automatically, no code changes needed. `images`
// takes priority over `cover` if both are set. Projects with neither keep
// the generated-gradient fallback so the grid stays uniform. The same
// `cover`/`images` value also drives the project modal's own image slot
// (the "overlay") -- one field, no separate modal-image prop.

export type Project = {
  slug: string;
  title: string;
  summary: string; // summary = problem + approach
  details?: string[]; // optional deeper technical narrative, modal-only (not shown on the card)
  stack: string[];
  links: { github?: string; demo?: string; devpost?: string };
  cover?: string; // single static image; falls back to a generated gradient when absent
  coverTall?: boolean; // taller, near-square image slot -- for portrait/square covers (e.g. phone mockups) that a landscape slot would crop to a thin band
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
    summary:
      "A digital twin of a real farm — built from a 2D video reconstructed into a 3D Gaussian Splat — that lets farmers (and AI agents) walk the field virtually to catch weeds, pests, and other crop-health issues without physically covering the whole property. A simulated drone flies a virtual camera through the splat, extracting frames that Gemini analyzes for problem areas.",
    details: [
      "- Collected data on-site at a real farm and generated a 3D Gaussian Splat with Scaniverse, then simulated drone flight paths by moving a virtual camera through the reconstructed scene.",
      "- Extracted frames from those flights and sent them to Gemini for weed, pest, and crop-health detection.",
      "- Gemini initially struggled with the splat's blurry, complex textures; improved accuracy by saturating images to make weeds stand out, overlaying grid/axis lines for more accurate bounding boxes, and running a two-stage detection pass (soil regions first, then weeds within them) that significantly cut false positives.",
      "- The platform also handles live weed detection with treatment dispatch, visualizes 40 IoT soil sensors across five layers on an interactive heatmap, and uses Google Agent Development Kit (ADK) agents to generate recommendations and help manage operations.",
    ],
    stack: ["Gaussian Splatting", "Scaniverse", "Google Gemini", "Google Agent Development Kit (ADK)", "IoT sensors"],
    cover: "/portfoliov2-images/farm-os.jpeg",
    links: {},
    metrics: [
      { label: "QuackHack 3", value: "Gemini Track Winner" },
      // { label: "Soil sensors", value: "40, across 5 layers" },
    ],
    featured: true,
  },
  {
    slug: "bastinel",
    title: "Bastinel",
    summary:
      "An AI hallucination-checker that doesn't just answer — it verifies itself. Two independent generator models answer a prompt, two judge models score each answer's factual grounding, and Bastinel averages those scores into a single, easy-to-read reliability score so users can tell at a glance whether an AI's answer actually deserves their trust.",
    details: [
      "- Runs every prompt through a four-model pipeline: two generator models answer independently, then two judge models check each answer's factual grounding and score its accuracy using carefully designed prompts.",
      "- Averages the judge scores into a single \"hallucination likelihood\" score, plus the judges' own reasoning and a side-by-side comparison of the generator answers — so users see not just what the AI says, but how much that answer actually deserves to be trusted.",
      "- Infrastructure runs on AWS with all LLM calls routed through OpenRouter (originally planned for AWS Bedrock, migrated for model availability and flexibility), with the pipeline automated via a GitHub Actions workflow.",
      "- Re-architected the pipeline after an early version introduced bias: generating with Gemini first and chaining every other model off that response meant the judges inherited Gemini's framing instead of evaluating independently, so each model now runs fully independently.",
      "- Frontend built with Framer Motion, Tailwind CSS, and shadcn/ui for a clean, modern interface.",
    ],
    stack: ["OpenRouter", "AWS", "GitHub Actions", "Framer Motion", "Tailwind CSS", "shadcn/ui"],
    cover: "/portfoliov2-images/bastinel.png",
    links: {},
    metrics: [{ label: "Models per query", value: "4 (2 generators + 2 judges)" }],
  },
  {
    slug: "aerosearch",
    title: "AeroSearch",
    summary:
      "A full-stack aviation search engine combining full-text search, semantic similarity, and live flight tracking. Search aircraft by manufacturer, model, and classification, compare two aircraft side by side, or watch live flights on a map — all backed by a containerized multi-service stack that starts with one `docker-compose up`.",
    details: [
      "- A Python ingestion service pulls data from OurAirports, OpenSky Network, and ADS-B Exchange, cleans and deduplicates records, upserts them into PostgreSQL on a 24-hour schedule, and polls live positions every 2 seconds into Redis.",
      "- An async FastAPI backend serves search, comparison, live-position, and \"similar aircraft\" endpoints; similarity search uses sentence-transformer embeddings (all-MiniLM-L6-v2) stored in pgvector, combined with Postgres full-text indexes for hybrid retrieval.",
      "- The React frontend has search with autocomplete, a compare view with per-metric winners, a Leaflet live tracker with trail lines, and detail pages with Recharts performance charts.",
      "- Redis caching is tuned per use case (60s for search results, 2s for live positions), with an OpenSky fallback for ADS-B coverage gaps; protected endpoints use JWT auth, with interactive API docs served at /docs.",
    ],
    stack: [
      "Python",
      "FastAPI",
      "SQLAlchemy",
      "asyncpg",
      "PostgreSQL + pgvector",
      "Redis",
      "React",
      "Vite",
      "Tailwind CSS",
      "Leaflet",
      "Recharts",
      "Docker",
    ],
    images: [
      { src: "/portfoliov2-images/aerosearch01.png", alt: "AeroSearch, screenshot 1" },
      { src: "/portfoliov2-images/aerosearch02.png", alt: "AeroSearch, screenshot 2" },
      { src: "/portfoliov2-images/aerosearch03.png", alt: "AeroSearch, screenshot 3" },
    ],
    links: {},
  },
  {
    slug: "ocr-expense-tracker",
    title: "OCR Expense Tracker",
    summary:
      "A responsive personal-finance dashboard for logging and reviewing spending, with manual entry alongside in-browser receipt scanning. Scan a receipt and Tesseract.js OCR extracts the fields client-side — nothing gets uploaded just to read a photo — while the dashboard filters by month/year and breaks spending down into interactive category pie charts.",
    details: [
      "- Client-side OCR: receipts are processed entirely in the browser with Tesseract.js and never uploaded for extraction.",
      "- Expenses can also be added manually through a validated modal form, built with React Hook Form and Zod for type-safe validation.",
      "- Data persists through Next.js API routes and Mongoose into MongoDB Atlas — no separate backend service.",
      "- The dashboard filters by month and year and visualizes category breakdowns as interactive pie charts (Recharts), with a UI built on Tailwind CSS and shadcn/ui.",
    ],
    stack: [
      "Next.js (App Router)",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "shadcn/ui",
      "React Hook Form",
      "Zod",
      "MongoDB Atlas",
      "Mongoose",
      "Tesseract.js",
      "Recharts",
    ],
    cover: "/portfoliov2-images/expense-tracker.png",
    links: {},
  },
  {
    slug: "stillbridge",
    title: "Stillbridge",
    summary:
      "A travel companion that makes flying calmer for neurodivergent travelers. Stillbridge tracks your flight — route, boarding time, gate, terminal, and live status — then turns the airport into one manageable step at a time: plan your timing, find a quieter route to the gate, and explore the terminal map with calm, low-stimulation spots marked.",
    details: [
      "- A flight card shows route, boarding time, gate, terminal, and live status (e.g. \"On time\"), with a \"Simulate gate change\" live demo so a disruption can be rehearsed calmly instead of sprung on the traveler at the airport.",
      "- \"Your next step\" breaks the journey down into a single calm action at a time — planning timing and finding a quieter, lower-stimulation route to the gate.",
      "- An interactive terminal map (\"Explore SFO\") surfaces calm spots and quieter areas across the airport.",
      "- A simple four-tab layout (Home, Map, My trip, Profile) and a soft, muted visual design are chosen deliberately to reduce sensory and cognitive load.",
    ],
    // TODO: real tech stack not yet known -- left empty rather than invented
    // (the card/modal both hide the stack row when this is empty). Fill in
    // once confirmed. Same for links.github / links.demo below.
    stack: [
      "Next.js (App Router)",
      "TypeScript",
      "React Native",
      "Tailwind CSS",
      "Convex"
    ],
    cover: "/portfoliov2-images/portfoliov2-stillbridge.png",
    coverTall: true, // near-square phone mockup -- taller slot so it isn't cropped to a band
    links: {},
  },
];
