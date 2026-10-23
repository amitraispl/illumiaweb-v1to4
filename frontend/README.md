# Illumia Software Development: four design directions

One Next.js 16 + TypeScript app holding four complete, animation-heavy takes on the
`illumiasolutions.com/software-development` section. Same content, same brand colours; different
layout, type, motion and page transitions. Open `/` to pick one.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + type-check
```

## The four versions

| Route | Name | Mood | Type | Signature moves |
|---|---|---|---|---|
| `/v1` | **Beacon** | Dark, cinematic; the cursor is a light source | Bricolage Grotesque · Carlito · JetBrains Mono (code only) | WebGL beacon shader hero, cursor spotlight revealing hidden code, scramble-decode headline, diamond preloader + diamond page transition, pinned horizontal services, dark→light page flip, SVG path drawn on scroll, velocity marquee, typing build log, Flip-animated work filter |
| `/v2` | **Editorial** | A printed issue; paper, ink, one crimson mark (ref: Obys Format) | Instrument Serif · Instrument Sans | Masthead letter rise, window-to-full-screen scroll scene, ink-fill statement, cursor-follow service previews, rolling nav links, stacking sheets, two-panel shutter transition, fill-in-the-blanks contact letter |
| `/v3` | **Kinetic** | Loud, playful, full colour fields (ref: Apricode) | Archivo variable (width 62–125) | Letters stretch condensed→wide, pointer-proximity type, pinned colour chapters, stacking service cards, drag rail with velocity skew, percentage intro, skewed sweep transition, 3D tilt tiles, three-step brief form, **Pause motion** control |
| `/v4` | **Blueprint** | Calm, architectural, slow (ref: Belgrade Arbor) | Cormorant Garamond · Manrope | Self-drawing isometric "building" (security → interface), floors light up as you read, scroll progress %, **timezone overlap tool** (uses the visitor's real timezone), pinned horizontal gallery, budget-split bars, clip-path curtain transition |

Every version has four pages: home, services, work, contact.

## Structure

```
app/
  page.tsx               version picker
  v1 … v4/               one folder per direction
    layout.tsx           fonts + Shell
    Shell.tsx            nav, menu, cursor, footer, page-transition pair
    page.tsx             home
    services|work|contact/page.tsx
    v*.css               all styles for that direction, scoped under .v1 … .v4
components/
  motion/
    SmoothScroll.tsx     Lenis driven by GSAP's ticker
    Transition.tsx       TransitionProvider + TLink: cover → navigate → reveal
    onEnter.ts           run intro animations once the page is uncovered
    effects.ts           magnetic, directional fill, count-up, timezone helpers
    Clock.tsx            live local time
  ui/Fragments.tsx       HTML "interface fragments" used as project imagery
lib/
  content.ts             all copy and data (REAL vs SAMPLE marked inline)
  gsap.ts                plugin registration (ScrollTrigger, SplitText, ScrambleText, DrawSVG, Flip, Text)
```

## Motion and accessibility rules followed

- Content is in the HTML on first paint. Hidden starting states are set by GSAP only, never by CSS,
  and `onPageEnter` has a fallback timer, so nothing stays hidden if an event is missed.
- `prefers-reduced-motion`: smooth scroll, transitions, intros and scroll scenes are skipped; the
  page is shown complete.
- Preloaders (V1, V3) play once per session.
- V3 has a visible Pause motion control for looping animation.
- Smooth scrolling switches off in automated browsers (`navigator.webdriver`) so audits and
  screenshot tools see the real page.

## Before launch: content to confirm or replace

- **Projects are concepts** (`lib/content.ts → projects`). Names, summaries and outcomes are sample
  copy and are labelled "concept" on every page. Replace them with real case studies or keep the label.
- **V4 budget split** (`app/v4/page.tsx → plan`) is a sample split.
- **Office timezones**: the main site lists countries only; the USA timezone (Eastern) is an assumption.
- **Forms are not wired.** Each contact form shows a thank-you state; connect them to the CRM or mail
  endpoint (search for `TODO`).
- Stats, partners, certifications, phone and address come from illumiasolutions.com (Oct 2026).
