# Portfolio v2: Build Plan

## 0. Build Instructions for Claude Code (read first)
**Task:** Build the portfolio described in this document from scratch in a new Next.js project.

**Workflow:** Build the whole site in one continuous run (no pausing for approval between phases). Still work through the phases in section 10 in order, and **verify each phase's acceptance criteria before starting the next**. At the end, give one summary: what was built, what was verified, known issues, and every remaining `TODO`.

**Rules:**
- **Placeholder content:** use realistic placeholder copy, images and data where real content is missing, and mark every placeholder with a `TODO` comment (and a visible `data-placeholder` attribute where practical) so they're easy to find. **Never invent facts about my experience, projects, metrics, dates or trips.** Placeholders may be generic in shape (e.g. "Project summary goes here, 2-3 sentences") but must not make specific claims.
- Use only the content already given in this plan (project names, experience entries, trips, role line). Everything else is a placeholder.
- Prefer the lighter option whenever a choice is unspecified, and note the choice in the final summary.
- Don't add features marked out of scope (resume PDF, contact form, GitHub stats, dark mode, category filters).
- Create a short `CLAUDE.md` in the repo root capturing: design tokens, motion rules, the "clarity over flash" principle, the placeholder/TODO rule, and the commands to run/lint/test.

**Definition of done (applies to every phase and the final build):**
1. **Runs clean:** `build`, `lint` and type-check pass with no errors.
2. **Lighthouse:** Performance 90+, Accessibility 95+, Best Practices 90+, SEO 90+ (mobile profile, on the home page and a blog page).
3. **Responsive check:** verified at 360px (mobile) and a standard desktop width (1440px), with no horizontal scroll, broken layouts or clipped modals. Mobile gets equal polish, not a degraded layout.
4. **Reduced motion:** with `prefers-reduced-motion` on, parallax, kinetic text, blob animation, cursor effects and sound are disabled and simple fades remain. Verified in practice, not assumed.

## 1. Goals & Principles
- Fresh take replacing the Sept light-editorial version: colorful, glassy, off-white, motion-forward.
- **Primary audience:** peers/designers/creatives and engineers/researchers. It should show taste and technical credibility.
- **Clarity wins over flash.** Motion supports content and never blocks or delays finding information.
- **Personality:** warm/personal and technical/precise. Human voice, understated engineering confidence, no gimmicky jokes.
- **Equal polish on desktop and mobile.** Both get a fully designed experience, not a degraded fallback.
- Target roles: MLE / SWE.

## 2. Stack
- **Next.js (App Router) + TypeScript**
- **Framer Motion**: page transitions, shared-element/layout animations, scroll-linked effects
- **Tailwind CSS**: custom tokens for the glass + gradient system
- **Lenis** smooth scroll: **desktop only**; use native scroll on touch devices for feel and performance. Disabled under reduced motion.
- **react-three-fiber + @react-three/drei (three.js)** for the travel globe (locked). Dynamically import it (no SSR), lazy-load when the travel section nears the viewport, and cap pixel ratio / use low-poly geometry for mobile performance.
- **MapLibre GL** for the flat map view (locked) and as the fallback when WebGL is unavailable or the device is low-power. Use a light/off-white map style that fits the palette.
- **Howler.js** for UI sounds; Vibration API for mobile haptics
- **MDX** (`@next/mdx` or `next-mdx-remote`) for the blog
- Deploy: **Vercel**, with my existing custom domain

## 3. Visual Direction
- **Base:** off-white (`#F7F5F0`-ish), never pure white.
- **Color: warm palette.** Coral, peach, amber, magenta/rose with a touch of soft violet for depth, in large blurred mesh blobs plus small highlights. Keep one cool-ish accent (deep indigo/ink) for text and contrast so it doesn't read muddy.
- **Glass: layered depth.** Frosted panels (blur, translucent 1px border, soft shadow) float over big colorful blobs to create real depth. Multiple glass layers with parallax between them.
- **Type (my defaults, no preference given):** serif + sans mix. An editorial serif such as Instrument Serif or Fraunces for large headline accents, a clean grotesque such as Geist or Inter for body, mono for small technical labels. Warm gradients plus a serif give a polished, personal feel while the mono keeps it technical.
- **Cursor (default):** subtle follower dot/ring on desktop that grows over interactive items; native cursor on touch.
- **Nav (default):** floating glass pill that hides on scroll down and returns on scroll up, with a section-progress indicator.
- **Inspiration mix:** Awwwards-style showcases (ambition and craft), clean product sites like Linear/Vercel/Stripe (restraint, polish), designer portfolios (whitespace, case-study structure).
- **Guardrails:** keep text contrast accessible over glass (use a tinted/opaque-enough panel behind body text); cap simultaneous `backdrop-filter` surfaces for performance; single light theme.

## 4. Hero
**Animated gradient-mesh background + kinetic typography.**
- Slow-moving colorful blobs (WebGL shader or layered blurred CSS/Framer blobs) behind everything.
- Intro format: **Name + role line "CS @ Oregon State University"** (e.g. "Tyler Quach" as the big kinetic headline, with "CS @ Oregon State University" beneath). Letters animate in, then subtly react to cursor/touch.
- Floating glass nav pill.
- CTA buttons: View Projects, Connect on LinkedIn.
- **Loading:** minimal fade-in only. No dedicated loader or intro sequence.
- Fallback: static gradient + simple fade for `prefers-reduced-motion` and low-power devices.

## 5. Sections
1. **Hero:** name, role, CTAs.
2. **About ("mix" copy):** punchy first-person lead lines up top, with more technical/personal detail revealed on scroll or expand. Photo, quick facts, word-by-word scroll reveal.
   - **Voice: curious builder + avid traveler.** Lead lines should tie the two together (figuring out how things work, shipping them, and exploring new places). This also sets up the Travel section as part of who you are, not a side feature.
3. **Experience:** vertical timeline of glass cards. Timeline line draws on scroll.
   - **Featured (large, expanded by default): Deloitte SWE intern.**
   - Secondary (compact cards, expandable): OSU ML research assistant, OSU TA/ULA roles, AWS Campus Ambassador, other leadership roles.
   - **ML research lives inside the OSU research assistant entry** (model composition with neural-symbolic constraints / MoE-style routing). Expandable for detail; no separate featured block.
4. **Projects:** grid of glass cards (AI Hallucination Detector, AeroSearch, Gate Tracker, FarmOS, Shell in C, NBA Player Efficiency Index, OCR Expense Tracker). Click expands the card into a modal (section 6).
5. **Travel:** globe/map entry plus per-trip galleries (section 7).
6. **Writing (blog):** short notes on projects, research and what you're learning. MDX files in the repo, rendered as glass-card list plus article pages with the same page transitions. Launch with 1-2 posts (or a "coming soon" state), since an empty blog hurts more than none. Include reading time and tags.
   - **Topics (all four):** project breakdowns, ML research notes (explained simply), internship lessons, travel + tech (e.g. building the travel map, trip write-ups). Use these as tags. Suggested first posts: one project breakdown and the travel-map build, since they're the easiest to write from work already done.
7. **Connect:** styled "Let's connect" glass block with LinkedIn button and email. LinkedIn also in nav and footer. No resume PDF, contact form or GitHub stats widget in v1 (not selected).

## 6. Projects: Expanding Cards
- Framer Motion `layoutId` shared-element animation: card morphs into a centered glass modal.
- **Modal content (consistent across all projects):** Problem + approach (why it exists, how it was built), tech stack chips, key outcomes, links (GitHub, demo).
- **Optional per-project blocks, shown only when available:** architecture diagram, video/screenshots, metrics. The modal layout must degrade gracefully when these are missing, with no empty placeholders.
- Backdrop dims and blurs; `Esc`/click-outside closes; focus trapped; URL hash makes projects deep-linkable.
- No category filters (projects stay uncategorized).
- Hover: slight tilt/gradient shift.
- **Later:** live interactive demos embedded in modals (not in v1; keep a slot in the data model).

## 7. Travel: Globe + Map + Galleries
- Entry: interactive 3D globe that transitions to a flat map (or a 2D map with a globe toggle) with pins per trip.
- Animated route arcs between destinations (flights/buses), drawn on scroll/hover.
- Trips: Japan (Sept 2026), London (study abroad), Australia + Vietnam (Dec 2026 to Jan 2027, shown as "upcoming").
- Click a pin to open that trip's gallery (photos, short notes, route recap) in a glass panel with a shared transition.
- Data in a typed `trips.ts` / JSON so adding a trip is trivial.

## 8. Motion System
- **Page transitions:** `AnimatePresence` in the layout; gradient wipe or fade/scale between routes, under ~600ms.
- **Scroll-driven:** `useScroll`/`useTransform` for parallax blobs and glass layers, progress indicator, timeline draw, text reveals; optional pinned intro for projects.
- **Micro-interactions:** magnetic buttons, custom cursor (desktop), hover lifts on glass.
- **Sound & haptics:** subtle, tasteful UI sounds (hover ticks, modal open/close, transition whoosh) and light haptics on mobile taps. **Off by default** with a visible sound toggle in the nav, persisted in localStorage; browsers block autoplay audio anyway.
- Shared easing curves and durations in one config.
- Respect `prefers-reduced-motion` (disable parallax/kinetic text/sound, keep simple fades).

## 9. Performance & Quality
- Lighthouse 90+ across the board.
- Lazy-load globe/map and heavy media; `next/image`; compress video.
- Test glass/blur on a mid-range phone since equal mobile polish is a requirement.
- Responsive 360px to ultrawide, with mobile-specific layouts for the timeline, modals and travel map (not just shrunk desktop).

## 10. Build Phases (with acceptance criteria)
Each phase must also meet the global definition of done in section 0.

1. **Setup:** Next.js + TS, Tailwind, fonts, design tokens, layout, glass nav, sound toggle scaffold, `CLAUDE.md`.
   - Done when: the app runs, tokens are defined in one place, nav works on 360px and desktop.
2. **Hero:** gradient mesh + kinetic type.
   - Done when: smooth animation on desktop and mobile, static fallback under reduced motion, text stays legible over the gradient.
3. **About + Experience:** scroll animations, timeline.
   - Done when: Deloitte renders as the featured expanded entry, others are expandable, timeline draws on scroll, mobile layout is purpose-built.
4. **Projects:** cards, expanding modal, data model.
   - Done when: all 7 projects render from the data file, the modal opens/closes with shared-element animation, focus is trapped, Esc and click-outside close it, deep-link hash works, and projects with no video/diagram show no empty blocks.
5. **Travel:** r3f globe, MapLibre flat map, routes, trip galleries.
   - Done when: pins and animated arcs work for all trips, galleries open from pins, globe lazy-loads, falls back to MapLibre without WebGL, and stays smooth on mobile.
6. **Transitions polish:** page transitions, cursor, micro-interactions, sound/haptics.
   - Done when: route transitions under ~600ms with no layout jank, sound is off by default with a persisted toggle, cursor is desktop-only.
7. **Writing, Connect, SEO:** MDX blog, Connect block, metadata, OG image, analytics hook.
   - Done when: 1-2 placeholder posts render with tags and reading time, LinkedIn button works in nav, footer and Connect block, OG/meta tags are present.
8. **QA and deploy prep:** full Lighthouse/responsive/reduced-motion pass, fix issues, production build, Vercel config notes for the custom domain.
   - Done when: all items in section 0's definition of done are verified and the final summary lists remaining TODOs.

## 10b. Suggested Structure & Data Schemas
```
/app
  layout.tsx, page.tsx
  /blog/page.tsx, /blog/[slug]/page.tsx
/components
  /hero, /about, /experience, /projects, /travel, /connect, /ui (GlassCard, Magnetic, Cursor, SoundToggle)
/content
  /blog/*.mdx
/data
  projects.ts, experience.ts, trips.ts
/lib
  motion.ts (shared easings/durations), sound.ts, utils.ts
/public (images, video, audio)
```
```ts
type Project = {
  slug: string; title: string; summary: string;       // summary = problem + approach
  stack: string[]; links: { github?: string; demo?: string };
  cover?: string;            // falls back to generated gradient
  video?: string; screenshots?: string[]; architecture?: string; metrics?: { label: string; value: string }[];
  demoEmbed?: string;        // reserved for later live demos
};
type Experience = {
  org: string; role: string; start: string; end?: string;
  featured?: boolean; summary: string; details?: string[];   // OSU research detail lives here
};
type Trip = {
  slug: string; title: string; status: "past" | "upcoming";
  stops: { name: string; lat: number; lng: number }[];
  routes: { from: string; to: string; mode: "flight" | "bus" | "train" }[];
  photos?: { src: string; alt: string; caption?: string }[]; notes?: string;
};
```

## 11. Assets Inventory
- **Projects:** screenshots for most; demo videos / screen recordings for some. Videos become short looping muted clips in modals (compressed, lazy-loaded, poster image first). Projects without them still get a gradient-generated cover so the grid stays uniform.
- **Photos:** professional headshot (About/hero), casual personal photos (About, warm tone), organized travel photos per trip.
- **Not available:** architecture diagrams (optional block stays hidden unless added; we can draw a few for the strongest projects later).

## 12. Still Open (placeholders until resolved)
- Final hex values for the warm palette. Claude Code should pick a tasteful warm set, define it as tokens in one place, and flag it as a TODO to review.
- Which domain is it, and who's the registrar (for pointing DNS at Vercel)?
- Bio copy: write a first-person draft together, or you provide? (voice is set: curious builder + avid traveler)
- Which 1-2 blog posts launch first?
- Which trip photos/notes to include for each trip, and how many per gallery?

## 13. Decisions Locked
- Workflow: whole build in one run, verifying each phase's acceptance criteria as it goes.
- Globe: react-three-fiber (lazy-loaded) with MapLibre flat map and fallback.
- Missing content: realistic placeholders marked `TODO`; never invent facts.
- Done = clean build/lint/types, Lighthouse targets, 360px + desktop check, reduced-motion verified.
- Domain: already owned (connect to Vercel at deploy).
- Hero role line: "CS @ Oregon State University".
- About voice: curious builder + avid traveler.
- Blog: all four topic areas.
