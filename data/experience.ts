// TODO: every `start`/`end` date below is a placeholder ("20XX") — real dates
// were never given in portfolio-plan.md, so none were invented. Replace
// before launch. Summaries are placeholder copy per section 0's rule
// ("never invent facts about my experience... metrics, dates").

export type Experience = {
  org: string;
  role: string;
  start: string;
  end?: string;
  featured?: boolean;
  summary: string;
  details?: string[];
};

export const experience: Experience[] = [
  {
    org: "Deloitte",
    role: "Software Engineer Intern",
    start: "20XX",
    end: "20XX",
    featured: true,
    summary:
      "Project summary goes here, 2-3 sentences on the problem, the stack, and what shipped by the end of the internship.",
    details: [
      "TODO: name the specific team/practice and the concrete problem worked on.",
      "TODO: call out the stack and one engineering decision worth highlighting.",
      "TODO: outcome or impact, stated plainly — no invented metrics.",
    ],
  },
  {
    org: "Oregon State University",
    role: "ML Research Assistant",
    start: "20XX",
    featured: false,
    summary:
      "Research assistant work on model composition — combining neural networks with symbolic constraints and exploring MoE-style routing between experts.",
    details: [
      "Core thread: model composition with neural-symbolic constraints and mixture-of-experts-style routing, as described in the plan.",
      "TODO: methods, datasets, and current results — not specified yet, placeholder only.",
      "TODO: advisor/lab name if it should be credited here.",
    ],
  },
  {
    org: "Oregon State University",
    role: "Teaching Assistant / Undergraduate Learning Assistant",
    start: "20XX",
    featured: false,
    summary:
      "TA/ULA role supporting a CS course — holding office hours, grading, and helping students work through core concepts.",
    details: [
      "TODO: which course(s) and term(s) — not specified yet, placeholder only.",
    ],
  },
  {
    org: "AWS",
    role: "Campus Ambassador",
    start: "20XX",
    featured: false,
    summary:
      "Campus Ambassador role representing AWS on campus — workshops, events, and community building around cloud/ML tooling.",
    details: [
      "TODO: specific events/workshops run and rough turnout — not specified yet, placeholder only.",
    ],
  },
  {
    // TODO: placeholder entry — the plan references "other leadership roles"
    // without naming a specific organization. Replace org/role/summary with
    // the real one(s) before launch; do not invent a club/org name.
    org: "Leadership Role (TBD)",
    role: "Leadership Role (TBD)",
    start: "20XX",
    featured: false,
    summary:
      "Placeholder for an additional leadership role mentioned in the plan but not yet named. Swap in the real organization, role, and summary.",
    details: ["TODO: replace this entire entry with the real organization and role."],
  },
];
