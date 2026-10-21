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
    org: "Oregon State University",
    role: "ML Research Assistant",
    start: "December 2025 - Present",
    featured: false,
    summary:
      "Developing Automated Data Systems for ML.",
    details: [
      "- Engineered bash-based data validation and automation pipelines to test model training across multiple real-world datasets under varying missing-data conditions, ensuring consistent, reproducible results on HPC infrastructure.",
      "- Conducted literature review and stress-tested research hypotheses for a novel data-repair framework, benchmarking its assumptions against existing imputation methods to help refine the project’s core contributions.",
    ],
  },
  {
    org: "Oregon State University",
    role: "Undergraduate Learning Assistant",
    start: "December 2025 - Present",
    featured: false,
    summary:
      "CS162 : Intro to Computer Science II",
    details: [
      "- Held office hours to debug code, review concepts for exams, and guide students toward problem-solving assignments.",
      "- Led weekly recitation sessions for 30+ students, reinforcing concepts including object-oriented programming.",
    ],
  },
  {
    org: "Deloitte",
    role: "Software Engineer Intern",
    start: "June 2026",
    end: "August 2026",
    featured: true,
    summary:
      "Goverment and Public Services",
    details: [
      "- Developed a client dashboard for metadata intake across dozens of fields, feeding a daily sync pipeline pushing owner-validated records into Collibra to support the data governance program, cutting manual processing time by ˜35%.",
      "- Built a RAID log and dashboard to track risks, assumptions, issues, and dependencies, surfacing blockers early and keeping the team, client, and senior leadership aligned on project status throughout the engagement.",
    ],
  },
  {
    org: "Coordinator",
    role: "Mobile Development Intern",
    start: "January 2026 - April 2026",
    featured: false,
    summary:
      "Startup within the NVIDIA Inception Program.",
    details: [
      "Integrated and managed backend connectivity with Better Auth and TanStack Query, implementing secure authentication flows, efficient API communication, and reliable client-side data caching tailored for mobile architecture.",
      "Headed the migration of an existing web application to a cross-platform mobile app using React Native and Expo, ensuring functionality and performance across iOS and Android while maintaining feature parity with the web product.",

    ],
  },
  // {
  //   // // TODO: placeholder entry — the plan references "other leadership roles"
  //   // // without naming a specific organization. Replace org/role/summary with
  //   // // the real one(s) before launch; do not invent a club/org name.
  //   // org: "Leadership Role (TBD)",
  //   // role: "Leadership Role (TBD)",
  //   // start: "20XX",
  //   // featured: false,
  //   // summary:
  //   //   "Placeholder for an additional leadership role mentioned in the plan but not yet named. Swap in the real organization, role, and summary.",
  //   // details: ["TODO: replace this entire entry with the real organization and role."],
  // },
];
