# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, served equally rather than one subordinated to the other:

- **Recruiters and hiring managers** evaluating Tyler for MLE/SWE internship
  and new-grad roles — deciding whether to reach out or move him forward in
  a pipeline.
- **Technical/design peers** (engineers, researchers, designers) assessing
  craft and technical credibility, independent of any hiring decision.

Tyler is currently an undergrad CS student at Oregon State University,
**actively applying/interviewing now** (2026-2027 cycle) — the site should
read as current, not a dormant/static résumé page.

## Product Purpose

A personal portfolio that gets a visitor to take the next step — reach out,
remember him, or take his work seriously — by showing real project/research/
internship substance alongside visible design and engineering taste. Success
is a recruiter or peer walking away with enough signal to act (contact,
interview, keep in mind), not just "a site that looks good."

## Positioning

Most student portfolios are template-shaped résumé restatements. This one
pairs a motion-forward, glass/color visual system with real technical
depth (ML research, a government-sector internship, concrete projects) —
the craft itself is evidence of the technical credibility being claimed,
not just decoration around a bullet list.

## Operating Context

- Viewed cold by recruiters/hiring managers scanning quickly, and by peers
  giving it closer attention — both get equal polish, not a mobile
  afterthought (see `CLAUDE.md`: "Equal polish on desktop and mobile").
- Likely shared via a link (LinkedIn, applications, email) rather than
  browsed from a hub — first-viewport clarity on hero/name/role matters.
- Single light theme; no dark mode.

## Capabilities and Constraints

- Sections: Hero, About, Experience (chronological timeline, Deloitte
  featured), Projects (card grid → expanding modal, FarmOS featured),
  Travel (globe-only, no flat-map toggle), Writing/blog (MDX), Connect.
- Explicitly out of scope (locked decisions, don't reintroduce without being
  asked): resume PDF, contact form, GitHub stats widget, dark mode, project
  category filters, sound/haptics (Web Audio UI tones + Vibration API were
  built and then removed per direct request).
- Travel is globe-only — the MapLibre flat-map view was removed per a later
  "i dont want a map. just globe" request; don't reintroduce the toggle.
- Placeholder content is allowed and expected where real content is
  missing, marked with `TODO` + `data-placeholder`, generic in shape but
  never inventing specific facts (experience, projects, metrics, dates,
  trips). Real vs. placeholder is tracked per-field in `data/*.ts`.
- Definition of done includes: clean build/lint/typecheck, Lighthouse
  90+/95+/90+/90+ (mobile profile), verified at 360px and 1440px, and a
  practically-verified (not assumed) `prefers-reduced-motion` pass.

## Brand Commitments

- Name: Tyler Quach. Role line: "CS @ Oregon State University."
- Voice: curious builder + avid traveler — figuring out how things work,
  shipping them, and exploring new places are one throughline, not two
  separate pitches. Warm/personal and technical/precise; understated
  engineering confidence, no gimmicky jokes.
- Connect: LinkedIn (nav, footer, Connect block) + email; no other contact
  channel is in scope.

## Evidence on Hand

- **Experience** (`data/experience.ts`, real, chronological): Deloitte SWE
  Intern (Government and Public Services, featured); Coordinator Mobile
  Development Intern (NVIDIA Inception Program startup); OSU Undergraduate
  Learning Assistant (CS162); OSU ML Research Assistant (automated data
  systems for ML).
- **Projects** (`data/projects.ts`): FarmOS is real and featured — won the
  Gemini track at QuackHack; everything else about it (and all of
  AI Hallucination Detector, AeroSearch, OCR Expense Tracker) is still
  placeholder write-up/stack/links pending the real content.
- **Trips** (`data/trips.ts`, real dates/places, placeholder
  stops/routes/photos): Japan (past, Sept 2026), London (past, study
  abroad), Australia + Vietnam (upcoming, Dec 2026–Jan 2027).
- **Photos:** none yet — `data/about-photos.ts` and project `images`/`cover`
  fields are empty slots; carousels show their own placeholder state until
  real photos/screenshots are added. Do not fabricate placeholder photo
  content.
- **Absences the future work must not fill in:** no architecture diagrams,
  no demo videos, no bio copy draft yet (About's lead paragraph is a
  placeholder in the locked voice, not Tyler's actual words), no final
  warm-palette hex values (flagged TODO in `CLAUDE.md`/plan §12), no
  resolved blog post topics beyond the four tag categories.

## Product Principles

1. Clarity over flash — motion supports content and never blocks or delays
   finding information; this overrides visual ambition when the two
   conflict.
2. Craft is the pitch — the site's own design/engineering quality is part
   of what's being evaluated, for recruiters and peers alike.
3. Equal polish, both audiences, both breakpoints — no audience or device
   gets a degraded version.
4. Never invent specific facts — placeholders are generic in shape, never
   in claims (experience, projects, metrics, dates, trips).
5. Read as current — the site should reflect that Tyler is actively
   applying/interviewing now, not a dormant archive.

## Accessibility & Inclusion

Lighthouse Accessibility 95+ is a hard requirement (plan §0). `CLAUDE.md`
already encodes specific contrast findings from a prior QA pass — e.g.
`text-ink/40`–`/60` fail WCAG AA against `--color-base`, use `/65`+ for
large text and `/70`+ otherwise — and the reduced-motion hydration-safety
rule (`useReducedMotionSafe()`, never the raw framer-motion hook). Treat
those as binding constraints, not just prior bug history.
