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

- `--color-base` `#f7f5f0` — off-white background, never pure white.
- `--color-ink` `#1e1b4b` — cool ink/indigo accent for text and contrast.
  ~14.7:1 contrast ratio against `--color-base` (WCAG AAA).
- Warm palette: `--color-coral` `#ff6f59`, `--color-peach` `#ffb88c`,
  `--color-amber` `#f6ae2d`, `--color-rose` `#e8527a`, `--color-violet` `#8c7ae6`.
  **TODO:** placeholder hex values pending review (plan section 12).
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
- Under reduced motion: parallax, kinetic text, blob animation, cursor
  effects and sound must be disabled; simple fades remain. Verify this in
  practice (e.g. OS-level setting or devtools emulation), not by assumption.
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

- **MapLibre worker:** `maplibre-gl`'s default worker-URL resolution
  (relative to its own `import.meta.url`) doesn't survive Turbopack's chunk
  naming — the map silently renders a blank canvas with only a console
  `"Worker failed to load"` error, no thrown exception. Fixed by copying
  `node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs` to
  `public/vendor/maplibre-gl-worker.mjs` and calling `setWorkerUrl(...)`
  before constructing the `Map` (see `components/travel/TravelMap.tsx`).
  Re-copy that file if the `maplibre-gl` dependency version changes.
- **r3f light intensities:** three.js r155+ defaults to physically-correct
  (photometric) light units. Old-style intensities like `pointLight
  intensity={1}` that looked fine pre-r155 now render as nearly black a
  few world units away — tune by eye against a real render, not against
  pre-r155 example code (see `components/travel/TravelGlobe.tsx`).
- **Muted text opacity tiers:** `text-ink/40`, `/50`, `/60` all fail WCAG AA
  contrast (2.4:1, 3.2:1, 4.2:1) against `--color-base` — computed and
  confirmed via Lighthouse during the phase 8 QA pass. Use `/65` minimum
  for large text, `/70`+ for anything else; `/75`+ reads as "least muted."
  Don't reintroduce `/40`–`/60` for body/label text.

## Notes on tooling

- Next.js 16 / React 19 / Tailwind v4 — newer than most training data.
  `next dev` auto-regenerates `AGENTS.md` with framework-specific notes;
  when something about routing/config/metadata doesn't behave like the
  Next.js you remember, check `node_modules/next/dist/docs/` before
  assuming it's a bug.
- `cacheComponents`/`partialPrefetching` (Next 16 defaults) are disabled in
  `next.config.ts` — they're experimental canary features that require
  `"use cache"` annotations and would add friction to the rest of this build.
