# Illumia Software Development: six design directions

One Next.js 16 + TypeScript app holding six complete, animation-heavy takes on the
`illumiasolutions.com/software-development` section. Same content, same brand colours; different
layout, type, motion and page transitions. Open `/` to pick one.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + type-check
```

## The six versions

| Route | Name | Mood | Type | Signature moves |
|---|---|---|---|---|
| `/v1` | **Beacon** | Dark, cinematic; the cursor is a light source | Bricolage Grotesque · Carlito · JetBrains Mono (code only) | WebGL beacon shader hero, cursor spotlight revealing hidden code, scramble-decode headline, diamond preloader + diamond page transition, pinned horizontal services, dark→light page flip, SVG path drawn on scroll, velocity marquee, typing build log |
| `/v2` | **Editorial** | A printed issue; paper, ink, one crimson mark (ref: Obys Format) | Instrument Serif · Instrument Sans | Masthead letter rise, window-to-full-screen scroll scene, ink-fill statement, cursor-follow service previews, rolling nav links, stacking sheets, two-panel shutter transition, fill-in-the-blanks contact letter |
| `/v3` | **Kinetic** | Loud, playful, full colour fields (ref: Apricode) | Archivo variable (width 62–125) | Letters stretch condensed→wide, pointer-proximity type, pinned colour chapters, stacking service cards, drag rail with velocity skew, percentage intro, skewed sweep transition, 3D tilt tiles, three-step brief form, **Pause motion** control |
| `/v4` | **Blueprint** | Calm, architectural, slow (ref: Belgrade Arbor) | Cormorant Garamond · Manrope | Self-drawing isometric "building" (security → interface), floors light up as you read, scroll progress %, **timezone overlap tool** (uses the visitor's real timezone), pinned horizontal gallery, budget-split bars, clip-path curtain transition |
| `/v5` | **Lumen** | Dark, maximal; tens of thousands of points of crimson light rebuild themselves for every section | Unbounded · Carlito · Geist Mono | Raw-WebGL particle field (26k points, one draw call) that persists across pages and morphs between the Illumia mark, a torus knot, wave terrain, an office globe, a warp starfield and the words LET’S BUILD; pointer repulsion and click shockwaves; first-visit boot log; 3D service ring; odometer stats; pinned process rail; fly-through project tunnel; globe that turns to the office you point at; **working terminal** that drives the light (`morph globe`, `build`, `cat erp`…); **Ctrl/⌘ K command palette**; Flip case-study expand; brief-compiler contact form with live JSON; mosaic tile page transition; **Pause motion** control |
| `/v6` | **Flux** | Fluid teams, solid software: live crimson ink under everything | Syne · Carlito · Space Mono | Real-time **GPU fluid simulation** (WebGL2 Navier–Stokes: vorticity, Jacobi pressure, advection) stirred by the cursor and by scroll, with currents that change per section; **raymarched liquid-chrome object** that melts under the pointer and solidifies into the Illumia mark as you scroll; services as **throwable physics bodies** (gravity, collisions that splash ink, shake, zero-G); scroll-scrubbed **release pipeline** with flowing packets and a live log; **endless drag board** of projects with inertia; liquid accordion services; **chat-style brief** for contact; ink-flood page transition; first-visit ink drop; **generative WebAudio sound** (opt-in); Konami-code overdrive; **light theme** (the ink prints on paper instead of glowing; circular reveal from the switch, remembered per visitor); **Pause motion** control |

Every version has the same pages and copy as V5: home, services, one page per service (design, mobile,
web, integrations), process and contact. The old concept-project Work pages are kept, unrouted, in each
version's `_work/` folder.

## Structure

```
app/
  page.tsx               version picker
  v1 … v6/               one folder per direction
    layout.tsx           fonts + Shell
    Shell.tsx            nav, menu, cursor, footer, page-transition pair
    page.tsx             home
    services/page.tsx    the four services
    services/[slug]/     one page per service (page.tsx + Detail.tsx)
    process/page.tsx     the seven-stage cycle
    contact/page.tsx
    _work/               retired concept-project page, not routed
    v*.css               all styles for that direction, scoped under .v1 … .v6
components/
  motion/
    SmoothScroll.tsx     Lenis driven by GSAP's ticker
    Transition.tsx       TransitionProvider + TLink: cover → navigate → reveal
    onEnter.ts           run intro animations once the page is uncovered
    effects.ts           magnetic, directional fill, count-up, timezone helpers
    Clock.tsx            live local time
  ui/Fragments.tsx       HTML "interface fragments" used as project imagery
lib/
  copy.ts                the site copy every version shows; re-exports V5's app/v5/content.ts
  content.ts             company facts (offices, phone, address) and the older sample data
  gsap.ts                plugin registration (ScrollTrigger, SplitText, ScrambleText, DrawSVG, Flip, Text)
```

## Motion and accessibility rules followed

- Content is in the HTML on first paint. Hidden starting states are set by GSAP only, never by CSS,
  and `onPageEnter` has a fallback timer, so nothing stays hidden if an event is missed.
- `prefers-reduced-motion`: smooth scroll, transitions, intros and scroll scenes are skipped; the
  page is shown complete.
- Preloaders (V1, V3, V5, V6) play once per session.
- V3, V5 and V6 have a visible Pause motion control for looping animation. V5 under reduced motion draws the
  light field as still frames and morphs instantly.
  V6 under reduced motion renders the ink as one still image, shows the mark already solid and lays the
  physics bodies out as plain links. V6 sound is off until the visitor turns it on.
- Smooth scrolling switches off in automated browsers (`navigator.webdriver`) so audits and
  screenshot tools see the real page.

## Before launch: content to confirm or replace

- **Copy comes from V5.** Services, process, ownership and the rest live in `app/v5/content.ts`
  (taken from illumiasolutions.com/software-development); `lib/copy.ts` re-exports them for every version.
- **Concept projects** only appear in the retired `_work/` pages; nothing routed shows them.
- **Office timezones**: the main site lists countries only; the USA timezone (Eastern) is an assumption.
- **Forms are not wired.** Each contact form shows a thank-you state; connect them to the CRM or mail
  endpoint (search for `TODO`).
- Stats, partners, certifications, phone and address come from illumiasolutions.com (Oct 2026).
