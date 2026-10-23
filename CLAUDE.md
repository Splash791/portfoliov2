# CLAUDE.md

Project context for working in this repo. Full spec: `portfolio-plan.md`.

## Principle: clarity over flash

Motion supports content and never blocks or delays finding information.
This is a portfolio for peers/designers/creatives and engineers/researchers —
it should show taste and technical credibility, not just effects. Equal
polish on desktop and mobile; mobile is not a degraded fallback.

## Design tokens

Single source of truth: `app/globals.css` (`@theme` block) — this project
uses Tailwind v4's CSS-first config, so there is **no `tailwind.config.ts`**.

- `--color-paper` `#f7f5f0` — off-white background, never pure white.
- `--color-ink` `#141210` — black text/contrast (was a cool indigo
  `#1e1b4b`, changed to plain black per direct request). ~17.15:1
  contrast ratio against `--color-paper` (WCAG AAA).
- Earth-tone **camo** palette, matched against a BAPE camo reference image
  (replacing an earlier, more colorful earth-tone set, which itself
  replaced the original bright sunset set): `--color-coral` `#8c6b42`
  (tan), `--color-peach` `#ddd0b0` (cream), `--color-amber` `#b89968`
  (khaki), `--color-rose` `#5e4830` (umber), `--color-sage` `#3a2c1e`
  (espresso — the one renamed token; was `--color-violet`, since no earth
  palette here has had a violet in it). Token names otherwise kept as-is
  to avoid renaming every `bg-coral`/`from-amber` utility across the
  codebase each time the hex values moved.
- Glass surface: `--color-glass-bg`, `--color-glass-border`, `--blur-glass`,
  applied via the `.glass` utility class in `globals.css`. Cap how many
  stacked `.glass`/`backdrop-filter` surfaces appear on screen at once —
  it's not free, and body text needs enough opacity behind it to stay
  WCAG-contrast-accessible over colorful blobs.
- Fonts (via `next/font/google`, wired as CSS vars in `app/layout.tsx`):
  **Geist** (sans, body/UI — `--font-sans`), **Geist Mono** (small technical
  labels — `--font-mono`), **Instrument Serif** (large kinetic headline
  accents only, not body copy — `--font-serif`).

## Motion rules

Shared easing curves and durations live in `lib/motion.ts` — import from
there instead of inlining values, so the whole site moves on one rhythm.

- Page transitions stay under ~600ms (`durations.slow`).
- Every component-level animation must check reduced-motion and skip/shorten
  the animated transition when true. **Use `useReducedMotionSafe()` from
  `lib/motion.ts`, never framer-motion's `useReducedMotion()` directly.**
  The raw hook can read `matchMedia` synchronously on the client's first
  render while SSR always assumes non-reduced (no `window`) — any component
  that branches its JSX *structure* (not just a prop) on the raw value
  causes a React hydration-mismatch crash for visitors who actually have
  OS-level reduced-motion on. `useReducedMotionSafe()` is built on
  `useSyncExternalStore` specifically to avoid this; it was a real bug
  found during the phase 8 QA pass (reproduced via real Chrome +
  `page.emulateMediaFeatures`), not a hypothetical.
- `app/globals.css` also forces near-zero animation/transition durations
  globally under `prefers-reduced-motion: reduce` as a CSS-level backstop.
- Under reduced motion: parallax, kinetic text, blob animation, and cursor
  effects must be disabled; simple fades remain. Verify this in practice
  (e.g. OS-level setting or devtools emulation), not by assumption.
- There is no sound/haptics feature — it was built (Web Audio-synthesized
  UI tones, a nav toggle, Vibration API haptics) and then removed per user
  request. Don't reintroduce it without being asked.
- Lenis smooth scroll is desktop-only; touch devices get native scroll.

## Placeholder / TODO rule

Where real content is missing, use realistic placeholder copy/images/data
and mark it with a `TODO` comment, plus a `data-placeholder` attribute
where practical (see `app/page.tsx`). **Never invent specific facts about
experience, projects, metrics, dates, or trips** — only the content already
given in `portfolio-plan.md` is real; everything else is a placeholder,
generic in shape but not in specific claims.

## Commands

- `npm run dev` — local dev server (Turbopack).
- `npm run build` — production build; this also runs the TypeScript check
  (no separate `tsc` step is wired up — `next build` fails on type errors).
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`).

## Known gotchas

- **No Connect section, no nav, no Writing/blog preview on the homepage.**
  `components/connect/Connect.tsx`, a nav component, and
  `components/writing/Writing.tsx` all exist and work, but `app/page.tsx`
  doesn't render any of them — each was built, then explicitly removed
  from the page composition per direct request (Connect specifically was
  removed, later re-added with a real LinkedIn link, then removed again).
  Footer's and Hero's own LinkedIn links/CTAs stay regardless of whether
  the Connect block is in or out. Don't reintroduce any of these to
  `app/page.tsx` without being asked.
- **Travel is globe-only.** The MapLibre flat-map view was removed per a
  later user request ("i dont want a map. just globe") — `maplibre-gl` is
  no longer a dependency, `components/travel/TravelMap.tsx` no longer
  exists, and `components/travel/Travel.tsx` renders `TravelGlobe`
  directly (still lazy-loaded/no-SSR, still gated on a WebGL feature
  check with a text fallback). Section 7 of `portfolio-plan.md` describes
  a map+globe toggle — that's superseded, don't reintroduce it without
  being asked.
- **three.js physically-correct lighting:** r155+ defaults to
  photometric light units. Old-style intensities like `pointLight
  intensity={1}` that looked fine pre-r155 now render as nearly black a
  few world units away — tune by eye against a real render, not against
  pre-r155 example code. Relevant if touching the globe's custom
  `THREE.MeshStandardMaterial` in `components/travel/TravelGlobe.tsx`
  (built on `globe.gl`, not raw react-three-fiber — `@react-three/fiber`/
  `@react-three/drei` were removed as part of that swap).
- **Muted text opacity tiers:** `text-ink/40` and `/50` fail WCAG AA
  contrast (2.58:1, 3.43:1) against `--color-paper`; `/60` (4.73:1) only
  barely clears it — originally computed against the indigo ink used
  through most of the build, re-verified (not just assumed) after ink
  changed to plain black. Use `/65` minimum for large text, `/70`+ for
  anything else; `/75`+ reads as "least muted." Don't reintroduce
  `/40`–`/60` for body/label text.

## Notes on tooling

- Next.js 16 / React 19 / Tailwind v4 — newer than most training data.
  `next dev` auto-regenerates `AGENTS.md` with framework-specific notes;
  when something about routing/config/metadata doesn't behave like the
  Next.js you remember, check `node_modules/next/dist/docs/` before
  assuming it's a bug.
- `cacheComponents`/`partialPrefetching` (Next 16 defaults) are disabled in
  `next.config.ts` — they're experimental canary features that require
  `"use cache"` annotations and would add friction to the rest of this build.
