// TODO: every `summary` below is placeholder "problem + approach" copy per
// section 0's template style — no specific facts, tech stacks, metrics, or
// URLs are invented. `stack`/`links`/cover/video/screenshots/architecture/
// metrics are left empty or undefined until real assets exist (section 11).

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
    slug: "gate-tracker",
    title: "Gate Tracker",
    summary:
      "Project summary goes here, 2-3 sentences on what this tracking tool follows and the approach behind it. Replace with the real write-up.",
    stack: [],
    links: {},
  },
  {
    slug: "farmos",
    title: "FarmOS",
    summary:
      "Project summary goes here, 2-3 sentences on the farm-management problem this project tackles and how it's built. Replace with the real write-up.",
    stack: [],
    links: {},
  },
  {
    slug: "shell-in-c",
    title: "Shell in C",
    summary:
      "Project summary goes here, 2-3 sentences on which shell features (parsing, piping, job control, built-ins) were implemented and why. Replace with the real write-up.",
    stack: ["C"],
    links: {},
  },
  {
    slug: "nba-player-efficiency-index",
    title: "NBA Player Efficiency Index",
    summary:
      "Project summary goes here, 2-3 sentences on the efficiency metric computed and the data/approach behind it. Replace with the real write-up.",
    stack: [],
    links: {},
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
