---
name: Tyler Quach — Portfolio v2
description: A frosted-glass, warm-blob portfolio where glass panels float over color and a globe carries the travel throughline.
colors:
  tan: "#8c6b42"
  khaki: "#b89968"
  cream: "#ddd0b0"
  umber: "#5e4830"
  espresso: "#3a2c1e"
  ink: "#141210"
  warm-paper: "#f7f5f0"
  frost-glass-bg: "rgba(255, 255, 255, 0.55)"
  frost-glass-border: "rgba(255, 255, 255, 0.45)"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(3rem, 9vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "normal"
  headline:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(1.25rem, 3vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  pill: "9999px"
  lg: "2rem"
  md: "1.75rem"
  sm: "0.75rem"
spacing:
  section-y: "6rem"
  gutter-x: "1.5rem"
  card-gap: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.warm-paper}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.5rem"
  button-ghost:
    backgroundColor: "{colors.frost-glass-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.5rem"
  chip:
    backgroundColor: "rgba(20, 18, 16, 0.05)"
    textColor: "rgba(20, 18, 16, 0.75)"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.75rem"
  card-glass:
    backgroundColor: "{colors.frost-glass-bg}"
    rounded: "{rounded.md}"
    padding: "1.25rem 1.5rem"
  surface-lg-glass:
    backgroundColor: "{colors.frost-glass-bg}"
    rounded: "{rounded.lg}"
    padding: "2.5rem 1.5rem"
---

# Design System: Tyler Quach — Portfolio v2

## Overview

**Creative North Star: "The Frosted Atlas"**

Everything on this site sits on the same two-layer idea: slow-moving warm
color underneath, frosted glass floating above it. The color layer (tan,
khaki, cream, umber, espresso mesh blobs — an earth-tone camo family,
matched against a BAPE camo reference image per direct request; it
replaced an earlier, more colorful earth-tone set, which itself replaced
the original bright sunset set) is a Hero-only effect (see the Blob
Rhythm Rule below) after a round of experiments that briefly tried it
page-wide — it's where the "personal/warm" half of the brand lives;
the glass layer (one
repeated `.glass` treatment — blur,
hairline translucent border, soft ambient shadow) is where the
"technical/precise" half lives, because every panel gets the exact same
restrained treatment no matter what's inside it. The globe is the system's
signature object: a photographic day-lit Earth sphere (not a stylized or
frosted one — a true-color texture plus a bump map for real terrain
relief) with an espresso atmosphere glow and accent-colored pins, carrying
the travel/exploration half of the voice (curious builder + avid
traveler) into the one section that *is* an atlas rather than just
alluding to one. A color-keyed legend of clickable trip buttons sits below
it, so discovering what the pins are and reaching a trip gallery never
depends on hovering the canvas.

Density is calm, not sparse: generous vertical rhythm between sections
(`py-24`, `py-32` on larger screens), single accent color per surface
rather than multiple hues competing on one card, and a mono "label" layer
(uppercase section eyebrows, tech chips, dates) that keeps the whole thing
reading as an engineer's notebook rather than a marketing page. Confirmed
rejection: an earlier, lighter "editorial" version of this site (Sept) was
explicitly replaced for being too quiet — this system is colorful, glassy,
and motion-forward by deliberate contrast to that.

**Key Characteristics:**
- Warm blurred mesh blobs under frosted glass panels — color and clarity, never color *as* clarity.
- One glass treatment reused everywhere; no competing elevation language.
- Serif is a headline-only accent; everything that reads as a sentence is the sans body face.
- A mono "label" layer (eyebrows, chips, dates, button text) signals precision against the soft glass.
- Continuous, generous corner rounding at every scale — no sharp corners anywhere in the system.
- Dashed borders are reserved exclusively for placeholder/TODO slots, never decoration.

## Colors

The palette is one earth-tone camo family carrying color, plus one black ink for text and one off-white paper for the canvas — never more than one hue family competing on a single surface at once. (Tailwind/CSS token names below still read `coral`/`peach`/`amber`/`rose` in code — kept as-is to avoid renaming every `bg-coral`/`from-amber`/etc. utility across the codebase each time the hues moved, first from bright sunset to a more colorful earth-tone set, then to this camo set. `violet` was the one exception, renamed to `sage` during the first earth-tone pass since neither earth-tone set has a violet in it.)

### Primary
- **Tan** (`#8c6b42`, token `coral`): the leading accent. First hero blob, first travel-pin color, the featured-project metric chip background (`bg-coral/15`), first stop in every card-cover gradient fallback.

### Secondary
- **Espresso** (`#3a2c1e`, token `sage`): the deepest, darkest tone — the "depth" accent. Carries the globe's atmosphere glow and route arcs, a hero blob, and a travel-pin color — the accent most tied to the Travel/Atlas half of the system.

### Tertiary
- **Khaki** (`#b89968`, token `amber`): third hero blob and travel-pin color; a mid-tone between tan's warmth and espresso's depth.
- **Cream** (`#ddd0b0`, token `peach`): the lightest tone — a hero blob and a cover-gradient stop, used where a hue needs to feel airy rather than saturated.
- **Umber** (`#5e4830`, token `rose`): a cover-gradient stop pairing with tan/espresso; not used in the hero's own blob set (that set stays to the three warmest tones — see Named Rule below), reserved for card-level gradient variety.

### Neutral
- **Warm Paper** (`#f7f5f0`): the base canvas. Never pure white — body background, and the tint behind the carousel's prev/next controls (`bg-paper/70`).
- **Ink** (`#141210`, near-black): the single text/contrast color. ~17.15:1 on Warm Paper (WCAG AAA). Also doubles as the primary button fill and the modal backdrop tint (`bg-ink/30`).
- **Frost Glass** (`rgba(255,255,255,0.55)` fill / `rgba(255,255,255,0.45)` border): the one surface treatment every elevated panel uses, from the hero shell down to a single carousel's empty-state placeholder.

### Named Rules
**The One Earth Family Rule.** Decorative color always comes from the same five-tone camo family (tan/khaki/cream/umber/espresso) plus ink and paper — never a sixth hue, never anything outside this tonal range.

**The Three-Plus-White Rule.** The hero's own blob set deliberately excludes umber and keeps espresso to the fully-saturated set only elsewhere (card gradients) — the predecessor palettes' own version of this rule traced back to direct feedback that a violet/rose-heavy mix "read as floral" when overused; the same restraint principle carried forward here. The hero reads as its three warmest tones (tan/khaki/cream) plus a bright white haze blob, not the full five-tone palette at once.

**The Contrast Floor Rule.** Muted ink text never drops below `/65` opacity at large sizes or `/70` otherwise (`text-ink/40`–`/60` measured at 2.58:1–4.73:1 against Warm Paper with the current black ink — re-verified, not just carried over, when ink changed from indigo to black). `/75`+ reads as "least muted" and is preferred wherever the content allows it.

## Typography

**Display Font:** Instrument Serif (with Georgia, serif fallback)
**Body Font:** Geist (with system-ui, sans-serif fallback)
**Label/Mono Font:** Geist Mono (with ui-monospace, monospace fallback)

**Character:** An editorial serif for emotional, large-scale moments against a clean grotesque workhorse for anything read as a sentence, with a mono labeling layer running underneath both — the pairing is what makes "warm/personal" and "technical/precise" read as one voice instead of two.

### Hierarchy
- **Display** (400, `3rem`→`6rem` fluid, line-height 0.95): the hero name only — kinetic per-letter entrance, reacts to cursor/touch tilt.
- **Headline** (400, `1.25rem`→`2.25rem`): section leads, card/entry titles (project cards, featured experience org, blog post titles, project-modal title).
- **Body** (400, `0.875rem`, line-height 1.625, `text-ink/70`–`/80`): paragraph copy everywhere — About's lead, card summaries, experience detail bullets, connect copy.
- **Label** (400, `0.75rem` flat — no smaller tier, letter-spacing `0.05em`, uppercase where used): section labels ("ABOUT", "EXPERIENCE"), tech-stack chips, dates, metric labels, button text, the role line under the hero name.

### Named Rules
**The Serif-Is-An-Accent Rule.** Instrument Serif never appears in a paragraph — only headline-scale moments (names, titles, section leads). Everything that reads as a sentence is Geist.
**The Mono-Everywhere-Small Rule.** Any text under ~0.75rem is Geist Mono, not a smaller Geist size — the mono face is what signals "this is a label, not prose."
**The 11px Functional Floor Rule.** The label tier never drops below `0.75rem` (12px) — a `0.6rem`/`0.65rem` sub-tier existed here once (badges, chips, dates, reading time) and measured under the 11px legibility floor for functional text; collapsed to one size during the first polish pass, not left as a second, smaller label scale.

## Layout

Single-column mobile-first, promoted to a two-column grid at the `sm` breakpoint (640px) for card grids (Experience, Projects, Writing); the featured tile in Experience and Projects spans both columns (`sm:col-span-2`) rather than being pulled out of its natural (chronological / importance) position in the array. About uses an asymmetric `lg:grid-cols-[1.1fr_0.9fr]` text/photo split instead of a symmetric grid.

Container widths scale to content, not a single fixed shell: `max-w-5xl` for text-forward sections (About, Experience, Writing) and the Footer, `max-w-6xl` for the hero's inner glass shell, `max-w-7xl` for Travel specifically (wider than its siblings so the globe's own size isn't clamped by the section wrapper — a circular object needs more horizontal room than a text column).

Vertical rhythm is one consistent pair of values: `py-24` (mobile) stepping up to `py-32` (`sm:` and up) between every major section, with a flat `px-6` horizontal gutter at every width. Card grids use a `gap-6` (1.5rem) rhythm between tiles.

## Elevation & Depth

Hybrid, but deliberately narrow: color and blur create depth (blurred mesh blobs sitting behind everything, parallax-free but visually "floating"), while every elevated surface gets exactly one glass treatment — never a second, bespoke shadow value for an individual component. Flat elements (chips, footer text, nav-less page chrome) get zero shadow; anything that needs to feel "above" the page gets the one `.glass` treatment, nothing in between.

### Shadow Vocabulary
- **Glass ambient** (`box-shadow: 0 8px 32px rgba(20, 18, 16, 0.08)`): the only shadow value in the system. Paired with `backdrop-filter: blur(16px)` and a `1px` translucent border. Used on every `.glass` surface — hero shell, cards, modal, carousel, globe fallback state.

### Named Rules
**The One Glass Shadow Rule.** There is exactly one elevation treatment. Don't invent a second shadow value for an individual component, no matter how "special" it feels.
**The Glass Budget Rule.** Cap how many stacked `.glass`/`backdrop-filter` surfaces appear on screen at once — it isn't free, and body text needs enough opacity behind it to stay contrast-accessible over the colorful blobs underneath.

**The Blob Rhythm Rule.** Only **Hero** carries the mesh-blob backdrop (via the shared `SectionBlobs` component, which also animates an organic shape-morph, rotation, and a seeded per-blob drift path so blobs don't move in lockstep); every other section — **About**, **Experience**, **Projects**, **Travel** — is plain paper. This is the settled state after several rounds of experimentation: Hero-only originally, briefly carried into every section, pulled back to just About, briefly also copied verbatim onto Projects, then all of it pulled back to Hero-only. Hero's own `<section>` has no `max-w` (always full-width), so it never needed the full-bleed outer/inner-wrapper split the other sections used while they carried blobs. A new section being added to the page defaults to plain paper, not blobs — Hero is the one deliberate exception, not the default to extend from.

## Shapes

Continuous, generous rounding at every scale — there are no sharp corners anywhere in the system, only a small fixed vocabulary of radii: large hero/modal/connect/globe-fallback shells at `2rem` (32px), mid-weight cards (project, experience, writing, carousel) at `1.75rem` (28px), small inset tiles (metric `dl` cells, architecture/screenshot image frames) at `0.75rem` (12px, Tailwind's `rounded-xl`), and every pill-shaped control (buttons, chips, tags, the featured badge) fully rounded at `9999px`.

Borders are hairline and translucent, never a hard line: the glass border (`rgba(255,255,255,0.45)`) on elevated surfaces, a `border-ink/10` divider on the footer. The one deliberate exception is a dashed border (`borderStyle: "dashed"` applied inline so it wins over `.glass`'s own border shorthand at equal specificity) — reserved exclusively for placeholder/TODO slots (e.g. the empty photo-carousel state) and never used decoratively elsewhere. The hero headshot used to be one of these (a dashed "headshot placeholder" box) until a real photo replaced it.

## Components

Every interactive surface shares the same quietly-confident restraint: pill buttons, one glass treatment, no decoration that isn't load-bearing. Nothing shouts; everything is deliberate.

### Buttons
- **Shape:** fully rounded pill (`9999px`), `px-6 py-3` (desktop CTAs), `px-5 py-2.5` (modal footer links).
- **Primary:** solid Ink fill, Warm Paper text, Geist Mono label (e.g. "View Projects", "LinkedIn", "GitHub").
- **Ghost:** Frost Glass fill (the `.glass` class itself), Ink text — used for the secondary CTA ("Connect on LinkedIn") and any "Demo" link beside a primary "GitHub" button.
- **Hover:** both variants scale to `1.03` on hover (`transition-transform`); primary/ghost CTAs are additionally wrapped in the Magnetic component on fine-pointer devices, pulling toward the cursor within the button's bounds (spring damping 15 / stiffness 200) — disabled outright under reduced motion or on touch.

### Chips / Tags
- **Style:** `bg-ink/5` fill, `text-ink/75` label text, fully rounded, Geist Mono at `0.65rem`–`0.75rem`. Used for tech-stack previews, blog tags, and the featured-project metric badge (which instead uses `bg-coral/15` to stand out from ordinary stack chips).

### Cards / Containers
- **Corner Style:** `1.75rem` for the default card radius; the featured tile in a bento grid keeps the same radius but spans two columns and gets larger internal padding (`sm:px-8 sm:py-7` vs. `px-6 py-5`).
- **Background:** Frost Glass (`.glass`) uniformly; no card uses a flat/opaque background.
- **Shadow Strategy:** the single Glass Ambient shadow (see Elevation & Depth) — no card-specific override.
- **Border:** the Frost Glass hairline border, inherited from `.glass`.
- **Internal Padding:** `1.25rem–1.5rem` (`px-5 py-4` project cards, `px-6 py-5` experience cards), scaling up for featured/large variants.

### Modal (Project detail)
- **Style:** same Frost Glass surface at the large `2rem` radius, opened via a Framer Motion `layoutId` shared-element morph from the triggering card so the card visually *becomes* the modal.
- **Backdrop:** `bg-ink/30` with `backdrop-blur-sm`, dismissible by click-outside or Esc; focus is trapped inside while open.
- **Degrade gracefully:** optional blocks (stack chips, metrics, architecture diagram, video, screenshots, GitHub/demo links) render only when their data exists — never an empty placeholder block.

### Carousel (photo / cover)
- **Style:** Frost Glass frame at whatever radius its context calls for (`rounded-[2rem]` standalone, `rounded-none` nested inside a project card since the card itself owns the outer radius).
- **Controls:** circular `bg-paper/70 backdrop-blur-sm` prev/next buttons and small dot indicators (`bg-ink` active / `bg-ink/30` inactive) — omitted entirely when the carousel is nested inside another interactive element (a `<button>` can't contain a `<button>`).
- **Empty state:** Frost Glass frame with a dashed border and a single Geist Mono caption ("Photo carousel placeholder") — never a faked photo.

### Navigation
- **Intentionally absent.** A floating glass nav pill was in the original plan but was explicitly removed; the site currently has no persistent nav chrome. Don't reintroduce one without being asked.

### Signature Component: Travel Globe
A `globe.gl`-based 3D sphere (not raw Three.js/r3f) rendered on a transparent background so the page's own blob/paper backdrop shows through. Trip pins rotate through the full five-tone camo family (Tan / Espresso / Khaki / Umber / Cream); route arcs and the globe's atmosphere glow are both Espresso, tying the "depth" accent specifically to this section. Lazy-loaded with no SSR, gated behind a WebGL feature check that falls back to a plain Frost Glass panel with a Geist Mono status line ("3D globe isn't available on this device.") rather than failing silently. A hover-only cursor swap on the canvas is never the *only* affordance: an always-visible instruction line plus a row of Frost Glass pill buttons (one per trip, each carrying its matching pin-color dot) sits directly below the globe, giving touch, keyboard, and mouse users the same independent path into a trip gallery. Flight routes additionally animate: a plane icon glides the actual great-circle path with the route progressively drawing in behind it, disappearing and regenerating from the opposite end each pass rather than retracing itself; other travel modes render as plain static lines with no moving icon.

## Do's and Don'ts

### Do:
- **Do** keep the base canvas off-white (`#f7f5f0`) — never pure white, anywhere, including controls layered on top of photos.
- **Do** reuse the single `.glass` treatment for every elevated surface; introduce a new shadow or border value only if `.glass` itself changes.
- **Do** keep Instrument Serif to headline-scale moments only; route every paragraph, label, or button through Geist/Geist Mono.
- **Do** keep muted ink text at `/65`+ (large text) or `/70`+ (everything else) — `/75`+ by preference.
- **Do** gate every motion effect (parallax, kinetic text, blob animation, cursor follower, magnetic pull) behind `useReducedMotionSafe()`, never the raw framer-motion hook, and verify in practice, not by assumption.
- **Do** let optional project-modal blocks (metrics, architecture, video, screenshots, links) disappear cleanly when their data is absent — never render an empty placeholder block.

### Don't:
- **Don't** add a persistent nav bar, dark mode, resume PDF, contact form, GitHub-stats widget, or project category filter — all explicitly out of scope.
- **Don't** reintroduce the MapLibre flat-map/globe toggle — Travel is globe-only per a later direct request ("i dont want a map. just globe").
- **Don't** reintroduce sound or haptics (Web Audio UI tones, Vibration API) — built once, removed per direct request.
- **Don't** use a dashed border for anything other than a placeholder/TODO slot.
- **Don't** stack more `.glass`/`backdrop-filter` surfaces on one screen than the Glass Budget Rule allows, and don't let body text sit on glass without enough opacity behind it to stay contrast-accessible over the blobs.
