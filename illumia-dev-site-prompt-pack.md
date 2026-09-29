# Illumia Solutions — Software Development Wing
## Motion & Interaction Prompt Pack for Claude Code

> How to use this file: drop it in the repo root as `MOTION_BRIEF.md`. Paste **Prompt 0** into Claude Code first (it sets up the project and a `CLAUDE.md`). Then run Prompts 1 → 12 one at a time, reviewing each in the browser before moving on. Every prompt is self-contained and tells Claude Code exactly what to build, with what library, with what timings, and what "done" looks like.
>
> Placeholder: `[WING NAME]` = the name of the software wing (e.g. "Illumia Labs", "Illumia Engineering"). Replace globally before running.

---

## Part A — The creative concept

### The one idea: "We illuminate the build"

Illumia's brand is a single crimson beacon lighting deep charcoal space. For a software wing, that becomes a literal interaction model: **the page is dark until you light it up.** The cursor is a light source. Scrolling moves you from dark to light. Code, wireframes and structure are hidden in the darkness and revealed by the crimson glow. Every flashy effect on the site must serve this metaphor — if an animation doesn't "illuminate", "reveal", or "build", it doesn't go in.

This is what separates us from copying the inspiration sites: they're loud for loudness' sake. Ours is loud with a *reason*, and restrained everywhere else (brand rule: crimson is a scalpel, not a flood).

### Signature motifs (reuse across the whole site)

1. **The Diamond** — the Illumia mark. Used as preloader, page-transition shape, cursor, bullet points, loading states, and the favicon. It is the site's "shape language".
2. **The Beacon** — a soft crimson radial glow on charcoal-deep. Lives in the hero as a WebGL shader and follows the cursor with inertia.
3. **The Decode** — technical words (service names, stack names, stats labels) resolve from random code glyphs into real text. This is our "letter transition" and it signals *software*, which a generic char-rise doesn't.
4. **Dark → Light** — the brand's dark cover / light content rhythm becomes a scroll mechanic: sections physically transition background colour as you scroll.

### Brand tokens (must be used exactly)

```css
:root {
  --crimson: #B41F3C;         /* the accent. one emphasis per view */
  --crimson-deep: #8E162E;    /* hover / pressed */
  --crimson-on-dark: #E66A82; /* crimson TEXT on dark backgrounds */
  --crimson-soft: #E0A6B2;    /* tagline on dark */
  --crimson-tint: #FBE7EB;
  --ink: #26262B;
  --charcoal: #3D3D3E;
  --charcoal-deep: #1F1F25;   /* hero / dark sections base */
  --muted: #6E6E75;
  --subtle-on-dark: #C9C9CF;
  --white: #FFFFFF;
  --offwhite: #F4F5F7;
  --card: #F6F6F8;
  --border: #E2E2E7;
  --radius: 10px;
}
```

**Type:** Brand is Calibri (body) + optional Cambria (display). Calibri isn't a web font, so use their metric-identical open equivalents from Google Fonts: **Carlito** (for Calibri) and **Caladea** (for Cambria). Stack: `"Calibri", "Carlito", system-ui, sans-serif`.
**Proposed sub-brand addition (needs sign-off):** a monospace accent — **JetBrains Mono** — used *only* for eyebrows, code snippets, counters and the decode effect. It's the one typographic signal that says "this is the software wing" without breaking the parent brand. If brand says no, the decode effect falls back to Carlito uppercase with tracking.

Eyebrows: uppercase, bold, letter-spacing 0.2em, crimson (`--crimson-on-dark` on dark).
Tagline, verbatim, italic: *"Illuminating the path to SUCCESS"*.

### Site map (suggested)

`/` Home · `/services` · `/work` (+ `/work/[slug]`) · `/process` · `/stack` · `/about` · `/contact`

### Effect inventory — what goes where

| # | Effect | Where | Metaphor it serves |
|---|---|---|---|
| 1 | Diamond preloader with counter | First visit only | Light switching on |
| 2 | WebGL beacon hero shader | Home hero | The beacon |
| 3 | Decode + masked char-rise headline | Hero, section titles | Building / resolving |
| 4 | Cursor spotlight revealing hidden code layer | Hero + "What we build" | Illuminating what's hidden |
| 5 | Custom diamond cursor with contextual states | Global | The light source |
| 6 | Magnetic buttons with directional crimson fill | Global CTAs | Energy / attraction |
| 7 | Diamond page transition | All route changes | Beacon closes and reopens |
| 8 | Dark → light scroll colour morph | Home + Process | Brand rhythm |
| 9 | Pinned horizontal services track | Home / Services | Reading a pipeline |
| 10 | Velocity-reactive tech-stack marquee | Home / Stack | Momentum |
| 11 | Work cards with WebGL hover distortion + "View" cursor | Work grid | Revealing the case study |
| 12 | Build-log terminal + counting stats | About / Home | Proof, live-feeling |
| 13 | Process timeline drawn by an SVG line on scroll | Process | The path to success |
| 14 | Menu overlay with staggered links + live preview | Global nav | — |
| 15 | Giant footer wordmark with light sweep + tagline | Global footer | Sign-off |
| 16 | Micro-interactions (links, fields, toggles, scroll bar) | Everywhere | Polish |

---

## Part B — Claude Code prompts

### Prompt 0 — Project foundation + CLAUDE.md

```
You are building the marketing website for [WING NAME], the new software development wing of Illumia Solutions (illumiasolutions.com). The site must reach Awwwards-level motion quality: WebGL, smooth scroll, split-letter animation, page transitions and micro-interactions — while staying fast, accessible and on-brand. Read MOTION_BRIEF.md in the repo root fully before writing code; it is the source of truth for concept, tokens and effects.

Set up:
- Next.js (App Router, TypeScript, src/ dir), Tailwind CSS v4 with the brand tokens from MOTION_BRIEF.md defined as CSS variables and mapped into the Tailwind theme (colors: crimson, crimson-deep, crimson-on-dark, ink, charcoal, charcoal-deep, muted, subtle-on-dark, offwhite, card, border).
- Animation: gsap + @gsap/react (useGSAP hook), register ScrollTrigger, SplitText, and CustomEase globally in one file src/lib/gsap.ts. GSAP and all its plugins are free to use.
- Smooth scroll: lenis. One Lenis instance in a client provider (src/providers/SmoothScroll.tsx), driven by gsap.ticker (lenis.raf inside gsap.ticker.add, gsap.ticker.lagSmoothing(0)) and wired to ScrollTrigger.update on lenis 'scroll'.
- WebGL: three + @react-three/fiber + @react-three/drei for shaders.
- Fonts via next/font/google: Carlito (400, 700), Caladea (700), JetBrains Mono (400, 500). Expose as CSS vars --font-body, --font-display, --font-mono.
- Custom eases in src/lib/gsap.ts: CustomEase.create("illumia.out", "0.16, 1, 0.3, 1") and CustomEase.create("illumia.inOut", "0.76, 0, 0.24, 1"). These two eases are used everywhere; never use GSAP default "power1".
- A global reduced-motion hook src/hooks/useReducedMotion.ts. Every animation component must check it: if reduced motion is on, show final states instantly (no transforms, no WebGL animation loops, no smooth scroll).
- Folder structure: src/components/motion/ (reusable effects), src/components/sections/ (page sections), src/components/webgl/ (canvas + shaders), src/components/ui/ (buttons, links, fields).

Then create CLAUDE.md in the repo root that records these permanent rules:
1. Colors only from brand tokens. Crimson appears at most once as the dominant accent per viewport.
2. Only animate transform and opacity (plus clip-path and shader uniforms). Never animate width/height/top/left/margin.
3. Every GSAP animation lives inside useGSAP with a scope ref so it is cleaned up on unmount/route change.
4. All motion respects prefers-reduced-motion.
5. Durations: micro 0.2–0.35s, UI 0.5–0.8s, reveals 0.9–1.2s, page transition total ≤ 1.1s.
6. Eases: "illumia.out" for entrances, "illumia.inOut" for transitions and wipes.
7. Mobile (<768px or pointer: coarse): no custom cursor, no magnetic effects, WebGL replaced by a static CSS radial-gradient fallback, horizontal pin sections become vertical stacks.
8. Performance budget: Lighthouse performance ≥ 85 mobile, LCP < 2.5s, no layout shift from animations (reserve space, use visibility:hidden before reveal — never display:none).
   
Build a placeholder home page with a dark hero and one light section to prove fonts, tokens, Lenis and GSAP are working. Done = I can scroll smoothly and a test heading fades up.
```

---

### Prompt 1 — Diamond preloader (first visit only)

```
Build src/components/motion/Preloader.tsx — the first thing a visitor sees. Concept: the Illumia beacon switching on.

Sequence (total ~2.4s, then out):
1. Full-screen charcoal-deep (#1F1F25) layer, z-index above everything, body scroll locked (lenis.stop()).
2. Center: an SVG diamond (a square rotated 45°, 72px, stroke var(--crimson-on-dark), stroke-width 1.5, no fill). Animate its stroke drawing in using stroke-dasharray/stroke-dashoffset from full length to 0 over 1.4s, ease "illumia.inOut".
3. Bottom-left: a counter in JetBrains Mono, 14px, subtle-on-dark, zero-padded 3 digits: "000" → "100". Drive it with a GSAP tween on an object {v:0} to 100, onUpdate writes Math.round(v).toString().padStart(3,"0"). Duration matches the real asset loading: resolve when document.fonts.ready AND the hero WebGL canvas signals ready (expose a small zustand or context "ready" flag), with a minimum of 1.6s and a maximum of 3.5s.
4. Bottom-right: eyebrow text "[WING NAME] — INITIALISING" in mono, letter-spacing 0.2em, which decodes (use the Decode component from Prompt 3 if built; otherwise a simple fade).
5. At 100: the diamond fills crimson (#B41F3C) in 0.25s, then scales from 1 to ~40 (enough to cover the viewport diagonal) over 0.9s with "illumia.inOut", while its opacity goes to 0 in the last 30% — this reads as the beacon flaring into the hero glow behind it.
6. Simultaneously the preloader background fades out, the hero headline animation (Prompt 3) is triggered via a callback, lenis.start().

Only show on the first visit per session (sessionStorage flag inside try/catch). On subsequent navigations the page transition (Prompt 7) takes over. With reduced motion: skip entirely.

Done = hard refresh shows the sequence once, then navigating around doesn't show it again, and the hero text animates exactly as the preloader clears.
```

---

### Prompt 2 — WebGL beacon hero

```
Build src/components/webgl/BeaconHero.tsx: a full-viewport React Three Fiber canvas behind the home hero content. It is the living version of Illumia's "beacon" cover style: deep charcoal field lit by a soft crimson radial glow.

Implementation:
- A single fullscreen plane with a custom ShaderMaterial (orthographic camera, plane sized to viewport).
- Uniforms: uTime, uResolution, uMouse (vec2, normalized 0–1), uGlowColor (vec3 of #B41F3C), uBaseColor (vec3 of #1F1F25), uIntensity (0→1, animated in after preloader).
- Fragment shader:
  • Base colour charcoal-deep.
  • Primary glow: radial falloff centered at a point that lerps toward uMouse. Lerp in JS each frame with factor 0.04 so the glow trails the cursor with heavy inertia (it should feel like a slow, heavy light, not a cursor follower). Rest position when idle: (0.68, 0.38) — up-right, away from the headline which sits left, per brand rule "keep glow away from text".
  • Distort the glow's shape with 2D simplex noise (octaves 3, scale ~1.8, speed uTime*0.06) so its edge breathes organically.
  • A second, much fainter and larger glow at the opposite corner, crimson-deep, 20% strength, drifting slowly on a Lissajous path.
  • Film grain: hash-noise per pixel, amplitude 0.035, re-seeded each frame. Grain is what stops gradients banding and gives the premium, filmic feel.
  • Vignette darkening the edges by ~25%.
- Overlay (HTML, not WebGL): a faint dot grid (CSS background radial-gradient dots, 1px, 28px spacing, rgba(255,255,255,0.05)).
- Performance: dpr={[1, 1.5]}, frameloop "always" only while hero is in view — use an IntersectionObserver to set frameloop "never" when scrolled away. Signal "ready" to the preloader on first rendered frame.
- Fallback for mobile/coarse pointer/reduced motion/no WebGL: a CSS radial-gradient(circle at 68% 38%, rgba(180,31,60,0.45), transparent 55%) on #1F1F25 plus a static grain PNG generated via an inline SVG feTurbulence filter.

Done = the hero has a slow, breathing crimson light that lazily follows the cursor, with visible grain, and scrolling past the hero stops the render loop (check in the Performance panel).
```

---

### Prompt 3 — Letter transitions: Decode, Char-Rise, Roll

```
Build three reusable text components in src/components/motion/. All use GSAP SplitText. All re-split on resize (SplitText autoSplit / onSplit) and revert on unmount. All accept a `trigger` prop: "load" | "scroll" | "manual".

1) CharRise.tsx — for big headlines.
   - Split into lines AND chars; each line gets an overflow:hidden mask wrapper (SplitText mask: "lines").
   - Chars start yPercent: 110, rotate: 4 (slight tilt), and animate to 0 with stagger 0.018 per char, duration 1.0, ease "illumia.out".
   - Scroll trigger: start "top 85%", once.
   - A `highlight` prop takes a word; that word renders in crimson (crimson-on-dark on dark backgrounds) and gets an extra effect: after the rise completes, a thin crimson underline scales in from scaleX 0 → 1 with transform-origin left over 0.6s.

2) Decode.tsx — the software-wing signature. For eyebrows, service names, stack items, stat labels.
   - Split into chars. Each char cycles through random glyphs from the set "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]=+*#" before settling on its real letter.
   - Chars resolve left to right: char i begins resolving at i*0.03s and settles after 0.35s of cycling (swap glyph every 40ms). Unresolved chars render in var(--muted); resolved ones in their final colour — so you see a colour wave travel across the word.
   - Font must be JetBrains Mono (monospace prevents layout jitter while scrambling). Width must be locked: measure the final text first, set min-width.
   - Also export a hover mode: on mouseenter of a parent, re-run the decode quickly (total 0.4s).

3) RollText.tsx — for nav links and buttons.
   - Renders the label twice stacked inside an overflow:hidden span with height 1lh. On hover, both copies translate up 100% with per-char stagger 0.012 and duration 0.45, "illumia.out". The second copy is crimson. On mouseleave, reverse.

Hero usage: line 1 "We build software" (CharRise), line 2 "that lights the way." (CharRise, highlight="lights"), eyebrow above "[WING NAME] / ILLUMIA SOLUTIONS" (Decode), sub-copy fades up 0.2s after the last char.

Done = a demo page /lab/type showing all three components on dark and light backgrounds.
```

---

### Prompt 4 — Cursor spotlight reveal (the core "illuminate" moment)

```
Build src/components/motion/SpotlightReveal.tsx. This is the site's key metaphor: darkness hides the engineering; our light reveals it.

- Two stacked layers of identical size inside a relative container:
  • Top layer (what you normally see): the section's normal content — e.g. a big statement "Every product starts in the dark." on charcoal-deep.
  • Hidden layer (below): the "engineering view" of the same area — a monospace code block / architecture wireframe in crimson-on-dark and subtle-on-dark lines (use a pre-made SVG of boxes and connector lines representing a system architecture: client → API gateway → services → database, plus snippets of TypeScript).
- The top layer gets a CSS mask: mask-image: radial-gradient(circle var(--r) at var(--x) var(--y), transparent 0%, transparent 60%, black 100%). So where the cursor is, you see through to the engineering view.
- Update --x/--y with gsap.quickTo on mousemove (duration 0.5, "power3.out") so the spotlight trails smoothly. --r animates from 0 to 180px on mouseenter and back to 0 on mouseleave (0.5s).
- Add a soft crimson glow ring at the spotlight edge: a separate absolutely positioned div (radial-gradient ring) following the same coords.
- Mobile: no cursor, so auto-animate the spotlight along a slow figure-eight path when the section is in view (GSAP MotionPath or sin/cos on the ticker), radius 120px.
- Reduced motion: show a static split — top half content, bottom half engineering view.

Place it as the second section on the home page, right after the hero.

Done = moving the cursor over the section reveals the architecture drawing underneath through a soft-edged light, and on a phone it animates by itself.
```

---

### Prompt 5 — Custom cursor with contextual states

```
Build src/components/motion/Cursor.tsx, mounted once in the root layout. Hide native cursor (cursor: none on html) only on (pointer: fine).

- Two elements: a 6px crimson dot that follows the mouse exactly (gsap.quickTo x/y, duration 0.08), and a 36px ring (1px border, subtle-on-dark on dark sections, ink on light sections) that trails (duration 0.45, "power3.out").
- The ring is a DIAMOND not a circle: a square rotated 45deg with border-radius 2px. This is the Illumia mark as a cursor.
- Automatic colour inversion: add data-theme="dark" | "light" on every section; the cursor reads which section is under it (document.elementFromPoint throttled with rAF) and swaps border colour. Alternative: mix-blend-mode: difference — test both, keep whichever looks cleaner on the crimson elements.
- States driven by data attributes on hovered elements:
  • data-cursor="link": ring scales to 1.6, rotates to 0deg (diamond → square), dot hides.
  • data-cursor="view": ring morphs into an 88px crimson filled circle with the word "VIEW" in white mono 11px letter-spacing 0.2em, centered. Used on work cards.
  • data-cursor="drag": 88px circle with "← DRAG →". Used on horizontal carousels.
  • data-cursor="text": ring becomes a 2px × 28px vertical bar (text caret). Used over paragraphs if desired.
  • data-cursor="hide": both hidden (over iframes, WebGL work cards that draw their own).
- State transitions 0.35s "illumia.out". Idle: after 3s without movement, the ring slowly pulses (scale 1 → 1.15, yoyo, 1.2s).
- Disable entirely on touch devices and reduced motion.

Done = the cursor is a trailing crimson diamond that turns into a VIEW badge over work cards and flips colour across dark/light sections.
```

---

### Prompt 6 — Magnetic buttons with directional fill

```
Build src/components/ui/MagneticButton.tsx and use it for every primary CTA.

- Magnetic pull: on mousemove within the button's bounds + 40px padding, translate the button toward the cursor by 35% of the offset from its center, and translate the inner label by an additional 15% (parallax layering). Use gsap.quickTo x/y, duration 0.6, "power3.out". On mouseleave, spring back with elastic.out(1, 0.4) over 0.9s.
- Directional fill: the button is pill-shaped, 1px crimson border, transparent background, white or ink label depending on theme. On mouseenter, detect which edge the cursor entered from (compare entry point to center) and grow a crimson circle from that exact entry point: a child span with border-radius 50%, positioned at the entry coordinates, scale 0 → enough to cover the button (compute from button diagonal), 0.5s "illumia.out". On mouseleave, the circle shrinks toward the exit point. Label turns white during fill.
- Label uses RollText from Prompt 3.
- Arrow icon variant: an arrow that, on hover, exits right (x: 100%, opacity 0) and a duplicate enters from the left (x: -100% → 0), 0.4s.
- Primary button text: "Start a project". Secondary: "See our work".
- Touch: no magnetism, fill animates on :active instead.

Done = CTAs pull toward the cursor, fill crimson from the side you entered, and snap back elastically.
```

---

### Prompt 7 — Diamond page transitions

```
Build page transitions for all internal route changes. Concept: the beacon closes over the old page and reopens on the new one.

Implementation (App Router):
- Create src/components/motion/TransitionProvider.tsx with a custom <TransitionLink> component that replaces next/link for internal links. On click: preventDefault, play the "cover" animation, router.push(href) at the end of cover, then play the "reveal" animation when the new route's content has mounted (listen via a usePathname effect in the provider).
- Overlay: a fixed full-screen SVG with a single diamond path centered, fill charcoal-deep, with a 1px crimson-on-dark outline diamond drawn slightly larger behind it.
- COVER (0.55s, "illumia.inOut"): the diamond scales from 0 to cover the viewport (scale ~ viewport diagonal / diamond size, compute on resize) and rotates from 45deg to 0deg while scaling — so it arrives as a full square wipe. The outline diamond leads it by 0.06s. Simultaneously the old page content translates y: -40px and opacity to 0.6 (subtle parallax push).
- While covered: show the destination page name centered in the overlay using CharRise-style chars in Caladea bold 6vw, white, with a Decode mono eyebrow above it showing the route index e.g. "03 / WORK". Hold 0.15s.
- REVEAL (0.55s): the diamond scales down to 0 toward the center while rotating back to 45deg, revealing the new page, whose hero content starts its own entrance animation at 60% of the reveal.
- Scroll: call lenis.scrollTo(0, {immediate: true}) while covered. Kill all ScrollTriggers from the previous page (ScrollTrigger.getAll().forEach(t => t.kill())) before push, and ScrollTrigger.refresh() after the new page mounts.
- Browser back/forward: skip the cover, just run a short 0.35s reveal.
- Reduced motion: 0.2s cross-fade only.
- Also enable the View Transitions API for the work grid → case study transition specifically: the clicked card's image shares a view-transition-name with the case study hero image, so the image morphs into place (use it only if document.startViewTransition exists; otherwise fall back to the diamond).

Done = every nav click shows a diamond wipe with the destination title, pages never flash unstyled, scroll position resets, and no ScrollTrigger leaks between pages (check ScrollTrigger.getAll().length after several navigations).
```

---

### Prompt 8 — Dark → Light scroll morph

```
Build src/components/motion/ThemeMorph.tsx. Illumia's brand rule is dark hero/cover sections and light content sections. Turn that into scroll choreography.

- Each section declares data-theme="dark" or "light".
- One fixed full-screen background layer behind all content (z-index -1). Sections themselves are transparent.
- A ScrollTrigger per section (start "top 60%", end "bottom 60%") tweens the background layer's backgroundColor between #1F1F25 and #FFFFFF (or #F4F5F7), and tweens CSS variables --fg (text), --fg-muted, --accent-text (crimson-on-dark ↔ crimson) on document.documentElement, over 0.8s, "illumia.inOut". All text uses these variables so everything re-colours in sync.
- The nav bar and the cursor also read these variables, so they flip automatically.
- Special moment on the home page: between "Every product starts in the dark" (SpotlightReveal) and the Services section, place a 150vh "sunrise" section. Pin it. As you scroll through it, a crimson radial glow grows from the bottom center (scale 0.2 → 3) and then the whole screen washes to white, while the line "We bring it into the light." CharRises in the middle and changes colour from white to ink as the background passes under it (use a scrubbed timeline, scrub: 1).

Done = scrolling the home page feels like moving from night to day, with text, nav and cursor re-colouring smoothly, and the sunrise section plays scrubbed to the scrollbar.
```

---

### Prompt 9 — Pinned horizontal services track

```
Build src/components/sections/ServicesTrack.tsx: the services shown as a horizontal pipeline that scrolls sideways while the section is pinned.

Services (placeholders, edit later): 01 Custom Software · 02 Web Platforms · 03 Mobile Apps · 04 Cloud & DevOps · 05 AI & Automation · 06 Integration & APIs.

- Section pins (ScrollTrigger pin: true, scrub: 1, end: () => "+=" + (track.scrollWidth - innerWidth)). The inner track translates x from 0 to -(scrollWidth - innerWidth). Use invalidateOnRefresh.
- Each service is a panel 70vw wide (min 520px), light theme: white card, 1px border, radius var(--radius). Inside: huge number "01" in Caladea 18vw, color var(--border) (very faint), positioned overflowing the top-left; service name in Decode (triggers when the panel's left edge crosses 70% of viewport — use containerAnimation on the nested ScrollTrigger); 3-line description; a row of stack chips (mono, 12px, crimson-tint background, crimson text).
- Behind the panels, a thin horizontal crimson line runs the full track length, with a small diamond node where each panel starts. The line's scaleX scrubs from 0 to 1 with the scroll — the pipeline "connects" as you move through it.
- Progress indicator bottom-left: "02 / 06" in mono, updated via onUpdate, and a 120px progress bar.
- Each panel on hover: lifts y -6px, shadow deepens, and a small SVG illustration (line icon, 1.5px stroke) draws itself in via stroke-dashoffset.
- Mobile: no pin; vertical stack with each card revealing on scroll.

Done = scrolling down moves services sideways, the crimson pipeline line grows node to node, and service names decode as they arrive.
```

---

### Prompt 10 — Velocity-reactive tech-stack marquee

```
Build src/components/motion/VelocityMarquee.tsx and use it twice: once for the tech stack, once as a giant statement divider.

- Infinite horizontal loop built with GSAP (duplicate content enough to fill 2× viewport; use a horizontalLoop helper or xPercent wrapping with gsap.utils.wrap).
- Base speed: 40px/s. Scroll velocity from Lenis (lenis.velocity) boosts speed and sets direction: scrolling down moves it left faster, scrolling up reverses it. Smooth the velocity with a lerp (0.1) so it eases back to base speed.
- Skew: apply skewX proportional to velocity, clamped to ±8deg, lerped back to 0 — the text leans while scrolling fast.
- Row 1 (tech stack): items in Carlito bold 5vw, alternating ink and outlined text (color transparent, -webkit-text-stroke 1px var(--charcoal)), separated by small crimson diamonds. Items: TypeScript, React, Next.js, Node.js, Python, Go, Flutter, PostgreSQL, AWS, Azure, Docker, Kubernetes (edit later).
- Hovering an individual item pauses the whole row (timeScale tween to 0 over 0.4s), fills the outlined word solid crimson, and Decodes it.
- Row 2 (divider, dark section): "Engineered · Tested · Shipped · Supported ·" in Caladea 12vw, white, moving opposite direction.
- Reduced motion: static, wrapped list.

Done = two marquees that lean and accelerate with your scroll and reverse when you scroll up.
```

---

### Prompt 11 — Work grid with WebGL hover distortion + case study transition

```
Build /work and the home "Selected work" section.

Grid:
- Asymmetric 2-column grid (card heights alternate 4:5 and 16:10) with 6 case study cards, each with image, client name, one-line result ("Cut claim processing time 60%"), year and tags.
- Scroll reveal: each card image starts clip-path: inset(100% 0 0 0) and animates to inset(0) over 1.1s "illumia.out" while the image inside scales from 1.25 to 1 (reveal + zoom-out). Text Decodes after.
- Parallax: images move y at 0.85× scroll inside their frame (yPercent -8 → 8, scrub).

WebGL hover:
- A single shared R3F canvas (fixed, pointer-events none, full viewport) renders the hovered card's image on a plane positioned over the card (sync plane to DOM rect each frame — the "DOM-to-WebGL sync" technique). Keep the DOM img visible with opacity 0 while hovered so layout stays intact.
- Fragment shader on hover: a subtle liquid displacement following the cursor (noise-based UV offset, strength 0.03 at cursor falling off with distance), plus a restrained RGB split where crimson channel offsets by 0.004 in the direction of mouse velocity. Strength eases in/out over 0.4s. Keep it tasteful — this is a consultancy, not a music video.
- Cursor switches to data-cursor="view".
- Mobile: no WebGL; plain image with scale 1.03 on tap.

Filter bar (on /work only): tag buttons (All, Web, Mobile, Cloud, AI). Filtering uses GSAP Flip: record state, change filter, Flip.from(state, {duration: 0.7, ease: "illumia.inOut", absolute: true, onEnter: fade+scale in, onLeave: fade+scale out}).

Case study page /work/[slug]:
- Hero image shares view-transition-name with the card (see Prompt 7).
- Sections: Challenge / Approach / Stack / Result. Result section shows big numbers counting up (Prompt 12) and a before/after slider (drag handle is a crimson diamond, cursor "drag").
- "Next project" footer: full-width dark block; hovering it reveals the next project's image through an expanding circle clip-path from the cursor; clicking triggers the page transition.

Done = cards reveal with a wipe, distort liquidly under the cursor, filter with smooth Flip reflow, and open into case studies with the image morphing into place.
```

---

### Prompt 12 — Proof section: build-log terminal + counters

```
Build src/components/sections/BuildLog.tsx for the About page and a condensed version for Home.

Terminal:
- A dark card (charcoal-deep, 1px rgba(255,255,255,0.08) border, radius var(--radius)) with three muted dots in the header and title "illumia@[wing]:~".
- On scroll into view, lines type out in JetBrains Mono 14px, one char every 18ms, lines separated by 250ms pauses:
    $ illumia init --project "your-idea"
    ✓ discovery        complete
    ✓ architecture     approved
    ✓ build            142 commits · 98% test coverage
    ✓ deploy           production · zero downtime
    → illuminating the path to SUCCESS_
- "✓" in success green #1F9D55, "→" and final line in crimson-on-dark, blinking block caret at the end (steps(1) animation, 1s).
- Lines are real text in the DOM from the start (visibility controlled per char with SplitText) so screen readers and SEO see the content. Reduced motion: show all lines instantly.

Counters (next to or below the terminal), 4 stats in a row with thin border-left dividers:
- e.g. "50+ products shipped", "12 industries", "99.9% uptime", "24/7 support" (placeholders).
- Numbers in Caladea bold 7vw; tween from 0 with snap to integers (or 1 decimal for 99.9), duration 2s, "illumia.out", triggered at top 80%.
- The label below uses Decode.
- The suffix (+, %, /7) fades in only after the number lands, in crimson.

Done = when scrolled into view, the terminal types the build pipeline and the stats count up, landing with a crimson suffix.
```

---

### Prompt 13 — Process timeline drawn on scroll

```
Build /process and a home teaser: "The path to success" — a vertical path that draws as you scroll.

- A single SVG path runs down the page as a gently curving line (not straight — use a smooth S-curve that weaves left and right between steps). Stroke var(--crimson), 2px.
- Draw it with scroll: stroke-dasharray = total length, stroke-dashoffset scrubbed from length to 0 across the section (scrub: 0.5). Or use GSAP DrawSVG.
- A glowing crimson diamond "light" travels along the path at the drawing head (MotionPath, alignOrigin center, scrubbed to the same trigger) with a soft box-shadow glow — it's the beacon moving along the path.
- Five steps placed at nodes along the curve: 01 Discover · 02 Architect · 03 Build · 04 Test · 05 Launch & Support. Each node is an outlined diamond that fills crimson when the light reaches it (onUpdate compares progress to node positions), and its step card CharRises + fades in beside it, alternating left/right.
- Each step card contains a tiny looping micro-illustration in line art (1.5px): Discover = magnifier sweeping; Architect = boxes connecting; Build = brackets typing; Test = checkmarks ticking; Launch = rocket nudging up. Pure SVG + GSAP, loop only while in view.
- Mobile: path becomes a straight vertical line on the left edge, cards full width.

Done = scrolling down draws a crimson path with a glowing diamond riding its tip, lighting up each process step as it arrives.
```

---

### Prompt 14 — Navigation, full-screen menu

```
Build the global header and menu.

Header:
- Fixed, 88px tall, mix of logo (light variant on dark, dark variant on light, swapped by ThemeMorph variables — keep both inline SVGs and crossfade), 3 inline links (Work, Services, Contact) using RollText, and a menu button.
- Hides on scroll down (yPercent -100, 0.4s) and reveals on scroll up, using lenis direction. Gains a backdrop-filter: blur(12px) and a translucent background after 80px scrolled.
- Menu button: two lines that morph into an X (rotate ±45deg, 0.4s) — and the square containing them rotates 45deg into a diamond.

Full-screen menu overlay:
- Opens with a clip-path reveal from the top-right corner: clip-path: circle(0% at calc(100% - 44px) 44px) → circle(150% at ...), 0.8s "illumia.inOut". Background charcoal-deep with the beacon CSS glow bottom-left.
- Links in Caladea 7vw, stacked, each with its index "01"–"06" in mono crimson-on-dark superscript. They CharRise in with 0.06s stagger per link after the clip opens 50%.
- Hovering a link: other links dim to opacity 0.25; a preview panel on the right shows an image/graphic for that page, swapping via a vertical wipe (clip-path inset) 0.5s. A small crimson diamond slides vertically to align with the hovered link (gsap.to y).
- Bottom row: email (copy-to-clipboard on click with a "Copied" decode micro-feedback), socials with RollText, and the tagline in italic crimson-soft.
- Esc closes, focus is trapped while open, links are real <TransitionLink>s so the page transition runs after the menu closes.

Done = the menu bursts open from the button corner, links rise in, hovering previews each page, and navigating closes the menu then runs the diamond transition.
```

---

### Prompt 15 — Footer: giant wordmark with light sweep

```
Build the global footer (dark theme).

- Top: big CTA "Have something to build?" (CharRise) + MagneticButton "Start a project" + email in Caladea 4vw with a crimson underline that draws on hover.
- Middle: 4 columns (Services, Company, Contact, Offices) with RollText links.
- Bottom: the word "ILLUMIA" (or [WING NAME]) spanning the full footer width (fit to width with a resize-based font-size calc, Carlito bold, letter-spacing -0.03em), color rgba(255,255,255,0.06).
- Light sweep: a crimson gradient (linear-gradient 100deg, transparent 40%, rgba(230,106,130,0.9) 50%, transparent 60%) clipped to the text with background-clip: text, whose background-position follows the cursor x across the footer (quickTo, 0.8s) — the cursor literally illuminates the wordmark. When idle, the sweep drifts across every 6s.
- Footer reveal: the footer is position: sticky bottom 0 underneath the main content, and the last content section has a solid background, so scrolling to the end "uncovers" the footer (curtain reveal). The wordmark letters rise with yPercent 100 → 0, stagger 0.04, as it's uncovered.
- Very bottom line: "© 2026 Illumia Solutions · Illuminating the path to SUCCESS" (tagline italic crimson-soft), and a back-to-top diamond button that calls lenis.scrollTo(0, {duration: 1.6}).

Done = scrolling to the end uncovers the footer like a curtain, and moving the mouse sweeps a crimson light across the giant wordmark.
```

---

### Prompt 16 — Micro-interaction polish pass

```
Do a micro-interaction pass across the whole site. Implement each of these, then list every file touched.

1. Inline text links: underline via a pseudo-element, scaleX 0 → 1 from left on hover, and on mouseleave scale out to the right (transform-origin switches). 0.35s.
2. Form fields (contact page): floating labels that move up and shrink on focus/filled; on focus, the bottom border draws in crimson from center outward; invalid state shakes x ±6px, 3 cycles, 0.3s total; successful submit morphs the button into a diamond checkmark and the form fields collapse with a stagger.
3. Scroll progress: a 2px crimson line fixed at the very top, scaleX tied to page progress.
4. Section eyebrows: a 24px crimson line draws before the eyebrow text, then the text decodes.
5. Images everywhere: lazy-load with a charcoal placeholder and a fade + 1.04→1 scale on load.
6. Buttons: :focus-visible gets a 2px crimson-on-dark outline with 3px offset — never remove focus styles.
7. Scroll hint in hero: a small mono "SCROLL" label with a 40px line below it where a crimson segment travels down in a loop (1.6s).
8. Hover on tags/chips: background fills crimson-tint → crimson with text inverting, 0.25s.
9. Favicon: the diamond mark; when the tab is hidden, swap document.title to "Still here? ◆ [WING NAME]" and restore on return.
10. Selection colour: ::selection { background: var(--crimson); color: white }.
11. Contact page "Copy email" and phone: click copies, label decodes to "COPIED" then back after 1.5s.
12. 404 page: dark, beacon glow follows cursor (reuse BeaconHero), heading "Nothing to illuminate here." with CharRise, and a MagneticButton home.

Done = every interactive element has a considered hover, focus and active state.
```

---

### Prompt 17 — Performance, accessibility & QA

```
Audit and harden the site. Produce a report in QA.md with before/after numbers.

Performance:
- Run Lighthouse (mobile) on /, /work, /work/[first-slug]. Target performance ≥ 85, LCP < 2.5s, CLS < 0.05, TBT < 200ms.
- Dynamically import all WebGL components with next/dynamic { ssr: false } and render only after the hero text is painted.
- Ensure only one R3F canvas is active per page at once (hero canvas pauses when the work canvas is in view).
- Images through next/image with AVIF/WebP and correct sizes.
- Check for GSAP/ScrollTrigger leaks after 10 route changes; check for Lenis duplicate instances.
- Throttle all mousemove handlers through gsap.quickTo or rAF, never set state on mousemove in React.

Accessibility:
- prefers-reduced-motion: verify every component shows final state instantly and smooth scroll is disabled.
- SplitText output must keep aria-label on the parent with the full text and aria-hidden on split children, so screen readers read words, not letters.
- Decode component must not announce scrambled glyphs (aria-live off; real text in aria-label).
- Keyboard: full navigation with Tab, visible focus, menu focus trap, Esc closes overlays, skip-to-content link.
- Contrast: check crimson text on dark uses #E66A82, not #B41F3C. Body on dark uses #C9C9CF.
- Custom cursor never hides the native cursor for keyboard-only users (only hide cursor after a real mousemove).

Cross-device: test Safari (mask-image and backdrop-filter prefixes), Firefox, Chrome, iOS Safari (100svh not 100vh), Android Chrome, and a low-end device profile (4× CPU throttle): if average FPS < 45 during hero, drop grain and noise octaves via a quality flag.

Done = QA.md with scores and a list of fixes made.
```

---

## Part C — Tips for running this with Claude Code

- **One prompt per session chunk.** Don't paste three prompts at once — motion work needs visual review. After each prompt, open the page, then give feedback like: "The glow follows too fast, lerp 0.02" or "Char stagger feels slow, use 0.012".
- **Build a `/lab` route first** (Prompt 3 starts it). Every motion component gets a demo there. It's your internal playground and makes tuning fast.
- **Tune by numbers, not adjectives.** Instead of "make it smoother", say "duration 0.9 → 1.2, ease illumia.out". All timings in this file are starting points meant to be tuned.
- **If you get a chance to capture the inspiration sites**, record 10–20 second screen recordings of the specific moments you love (a transition, a hover), and describe them to Claude Code as: *trigger → what moves → how long → how it eases → what it reveals*. That five-part description is what makes Claude Code reproduce an effect accurately instead of approximating it.
- **Content before choreography.** Get real copy and real case-study images in before Prompts 11–13; animations tuned on placeholder text always need re-tuning.

---
---

# Part D — The Showcase: a portfolio of concept websites

## D1. The idea

The new wing has no case studies yet, so instead of an empty "Work" page we build **a showroom of fully working concept websites**, one per major business type. Each one is a real, clickable mini-site with its own brand, fonts, colours and signature interactions. A prospect in any industry can open "their" demo and immediately picture their own site.

**Rule of honesty (important for sales credibility):** every demo is labelled **"Concept build"** with a fictional brand name. Never present them as client work. The pitch is: *"This is what we can build for a business like yours."*

**Rule of range:** the demos must NOT look like the Illumia site or like each other. Each has its own design language. The only shared element is the thin Illumia "frame bar" around them. Range is the entire point of the page.

**Rule of function:** each demo includes at least one real business feature (cart, booking, filter, calculator, form flow), not just pretty scrolling. Businesses buy features; visuals get them in the door.

## D2. The concept for the Showcase page itself: "The Prism"

Illumia's idea is light. Pass white light through a prism and it splits into a spectrum of colours. That's the showcase: **one studio, one light, split into many industries, each with its own colour.**

- The Showcase index opens on a dark screen with a single white beam entering from the left, hitting a slowly rotating glass prism (WebGL, refraction material), and fanning out into a spectrum of coloured beams on the right.
- Each beam is one industry demo. Hovering a beam brightens it and shows that demo's name and a live preview. Clicking it zooms along the beam into the demo.
- Below the hero (for people who just want to scroll), a filterable grid of all demos.

This ties the portfolio straight back to the brand story instead of being a generic thumbnail grid.

## D3. The demo line-up

Tier 1 = build first (highest demand, strongest showpieces). Tier 2 = next. Tier 3 = nice to have.

| # | Industry | Fictional brand | Design direction | Signature "wow" | Real business feature | Tier |
|---|---|---|---|---|---|---|
| 1 | Sports club / team | **Northgate FC** | Bold, loud, condensed type, stadium energy | Scroll-driven player cards that flip into stat sheets; match-day countdown with decode digits | Fixtures/results table, ticket tier selector, live-score widget (mock data) | 1 |
| 2 | Fashion / apparel e-commerce | **MAISON ÉCRU** | Editorial, minimalist, huge serif, lots of whitespace | Lookbook with drag-scroll gallery and image-trail cursor; product image hover swaps model/flatlay | Product listing with filters, product page with size/colour picker, slide-out cart | 1 |
| 3 | Restaurant / café | **Ember & Salt** | Warm, dark, textured, food photography-led | Menu where hovering a dish shows a floating photo following the cursor; steam/smoke shader in hero | Table reservation flow (date, party size, time slots), menu category tabs | 1 |
| 4 | SaaS / tech product | **Stackwise** | Clean, dark mode, gradients, product-led | 3D product UI screenshots tilting in perspective on scroll; animated feature bento grid | Pricing table with monthly/yearly toggle, interactive product tour | 1 |
| 5 | Real estate | **Harbor & Stone** | Premium, calm, architectural, neutral palette | Full-screen property hero with clip-path image transitions; map with animated pins | Property search with filters (price, beds, area), mortgage calculator, property detail gallery | 1 |
| 6 | Healthcare clinic | **Clearwell Clinic** | Soft, trustworthy, rounded, lots of breathing room | Calm micro-animations only (breathing gradient, gentle reveals); showcases restraint as a skill | Doctor directory with specialty filter, appointment booking wizard, accessibility toggle (large text/high contrast) | 2 |
| 7 | Fitness / gym | **PULSE Athletics** | Neon on black, high contrast, kinetic | Text that stretches and compresses with scroll velocity; class schedule with animated filtering | Weekly class timetable, membership plan comparison, BMI/calorie calculator | 2 |
| 8 | Hotel / travel | **Casa Solenne** | Sun-washed, Mediterranean, elegant | Smooth horizontal room gallery; day→night colour shift of the whole site based on scroll | Room booking with date-range picker and price calculation, experiences carousel | 2 |
| 9 | Fintech / banking | **Ledgerly** | Precise, cool, navy + one accent, data-rich | Live-animating charts, card that rotates in 3D showing front/back | Loan/savings calculator with animated chart, account-type comparison, secure-looking signup flow | 2 |
| 10 | Corporate / law / consultancy | **Whitmore & Crane** | Conservative, serif, sober, prestigious | Subtle: line-drawn dividers, elegant page transitions, text reveals only | Team directory with bios, practice areas, contact form with office selector | 2 |
| 11 | Education / online courses | **Brightpath Academy** | Friendly, colourful, illustrated | Playful illustrated characters reacting to scroll; progress bar animations | Course catalogue with filters, course detail with curriculum accordion, enrolment flow | 3 |
| 12 | Automotive dealer | **Veloce Motors** | Sleek, dark, cinematic | 360° car viewer (image sequence scrubbed on drag), colour configurator | Inventory filter, car configurator with live price, test-drive booking | 3 |
| 13 | Events / conference | **SIGNAL Summit 2027** | Experimental, big type, grid-breaking | Kinetic typography hero, speaker grid with hover portraits | Agenda with day tabs and track filters, ticket selection | 3 |
| 14 | Local services (plumber, cleaner, contractor) | **Brightline Home Services** | Practical, bold CTA, trust badges, fast | Before/after sliders; the skill shown here is conversion + speed (perfect Lighthouse) | Instant quote estimator, service-area checker, click-to-call sticky bar | 3 |
| 15 | Non-profit / NGO | **Open Harvest** | Human, photography-led, warm | Impact counters, scroll story with pinned photo narrative | Donation widget with amount presets and recurring toggle | 3 |

Why 14 (local services) and 6 (healthcare) matter even though they're "less flashy": most of Illumia's paying customers will be ordinary businesses. Showing that we can do calm, fast, accessible sites is as persuasive as showing WebGL.

## D4. Architecture decision (tell Claude Code this up front)

Each demo lives in the same Next.js app but in its own **route group with its own root layout**, so fonts, CSS variables and global styles never leak between demos or into the Illumia site:

```
src/app/
  (illumia)/            ← main site, Illumia brand
    layout.tsx
    showcase/page.tsx   ← the Prism index
  (demos)/
    showcase/sport/     ← Northgate FC   (own layout.tsx, own tokens, own fonts)
    showcase/fashion/   ← MAISON ÉCRU
    showcase/restaurant/
    ...
```

Each demo folder contains: `layout.tsx` (fonts + theme), `tokens.css`, `data/` (JSON mock data), `components/`, and a `demo.config.ts` with metadata used by the showcase index (name, industry, colour, stack, features, thumbnail video path).

---

## D5. Claude Code prompts for the Showcase

### Prompt 18 — Showcase index: "The Prism"

```
Build /showcase on the Illumia site (inside the (illumia) route group, Illumia brand). Read Part D of MOTION_BRIEF.md first.

Data: collect every src/app/(demos)/showcase/*/demo.config.ts into a single registry (src/lib/showcase-registry.ts). Each config exports: slug, brandName, industry, tagline, spectrumColor (hex), tier, stack (string[]), features (string[]), previewVideo (path to a 6–10s muted mp4 loop), poster (image).

Hero — "The Prism" (dark, 100svh):
- React Three Fiber scene. A triangular glass prism (drei MeshTransmissionMaterial: thickness 1.2, chromaticAberration 0.6, ior 1.5, roughness 0.05) rotating slowly on the Y axis (0.08 rad/s), slight float.
- A white beam (a thin additive-blended plane with a soft gradient texture) enters from the left edge and hits the prism.
- From the prism's right face, N beams fan out (N = number of demos), each coloured with its demo's spectrumColor, spread over ~50°. Beams are additive planes with a subtle noise-flicker shader.
- Beam labels: at each beam's end, an HTML label (drei Html) with the industry name in mono uppercase, decoded on load.
- Hover a beam or label: that beam brightens (opacity 0.35 → 1, width ×1.6), others dim to 0.1, and a floating preview card (320×200, radius 10) appears near the cursor playing that demo's previewVideo, with brand name and tagline beneath.
- Click: camera dollies along the beam toward the right edge (0.9s, illumia.inOut), the screen washes to that beam's colour, then the route changes to the demo. On the demo side, the colour wash fades out revealing the demo.
- Headline over the left third: "One studio. Every industry." (CharRise), sub: "Concept builds showing what we design and engineer for businesses like yours."
- Mobile / reduced motion: static SVG version of the prism with coloured beams; beams are tappable links.

Grid (light section below):
- Filter chips: All, Commerce, Hospitality, Services, Corporate, Tech, Lifestyle (map each demo to one category in its config).
- Cards (3 columns desktop, 1 mobile): poster image that swaps to the playing previewVideo on hover (play on hover, pause and reset on leave), a 4px top border in the demo's spectrumColor, brand name, industry, and 3 feature chips. "Concept build" tag in the corner.
- Filtering uses GSAP Flip (same as Prompt 11).
- Cursor state "view" on cards.

Done = /showcase opens on a refracting prism splitting light into coloured industry beams; hovering previews a demo, clicking travels into it.
```

### Prompt 19 — Shared demo frame + demo scaffolding

```
Build the shared wrapper every demo uses, and a generator so new demos are consistent.

1) src/components/showcase/DemoFrame.tsx — a slim bar (44px) fixed at the top of every demo, above the demo's own nav:
   - Left: small Illumia diamond + "Back to showcase" (TransitionLink to /showcase).
   - Center: "{brandName} — Concept build by Illumia [WING NAME]".
   - Right: device toggle (Desktop / Tablet / Mobile). Choosing tablet or mobile renders the demo inside a centered device-sized iframe of the same route with ?framed=1 (390×844 for mobile, 820×1180 for tablet) on a charcoal-deep backdrop, with a smooth width animation. Inside the iframe, the DemoFrame hides itself when framed=1.
   - Right: "Specs" button opening a slide-over drawer: industry, stack chips, features list, a "Lighthouse" row with scores (read from a generated JSON — see Prompt 17 QA script, run per demo), and a MagneticButton "Get a site like this" linking to /contact?ref={slug} (pre-fill the contact form's project type).
   - Bar style: charcoal-deep at 92% opacity with backdrop blur, Illumia fonts, so it's clearly "our" chrome around "their" site.
   - Collapses to a floating diamond button on scroll down; expands on scroll up.

2) scripts/new-demo.ts — a CLI (run with `npx tsx scripts/new-demo.ts <slug>`) that scaffolds src/app/(demos)/showcase/<slug>/ with layout.tsx (includes DemoFrame, loads fonts from a config), tokens.css (empty token template), demo.config.ts (template), data/, components/, page.tsx with a hero placeholder.

3) Each demo layout must: import only its own fonts via next/font, scope all tokens under a [data-demo="<slug>"] attribute on its root element, and use its own Lenis settings if it wants different scroll feel. Demos may reuse the motion components from src/components/motion/ but must restyle them via their own tokens.

4) Add "noindex" meta to demos? No — keep them indexable but add a visible "Concept build" note in each demo footer and in metadata description, so nobody mistakes them for real businesses.

Done = running the generator creates a working empty demo at /showcase/<slug> with the frame bar, device toggle, and specs drawer.
```

### Prompt 20 — Demo: Northgate FC (sports club)

```
Build the Northgate FC demo at /showcase/sport. A fictional professional football club. Design: loud, stadium-at-night energy.

Tokens: navy #0B1733, electric lime #D4FF3A (accent), white, steel #8A94A6. Fonts: "Anton" (display, condensed, uppercase), "Inter" (body), "JetBrains Mono" (stats). spectrumColor #D4FF3A.

Sections & interactions:
1. Hero: full-bleed stadium photo with dark overlay and a subtle floodlight flicker (CSS animated radial gradients at the top corners). Giant "NORTHGATE" in Anton that splits: top half slides left, bottom half slides right on scroll (scrub), revealing "NEXT MATCH" block underneath.
2. Match-day countdown: DD:HH:MM:SS in mono digits, each digit change animated as a vertical flip (old digit yPercent -100, new from 100). Opponent crest vs our crest (simple SVG shields), competition, venue, "Buy tickets" CTA.
3. Squad: horizontal drag carousel (cursor "drag") of player cards (photo cutout, number in huge outlined Anton behind the player, name, position). Click a card: it flips in 3D (rotateY 180, 0.8s) to show a stat sheet with animated bar charts (goals, assists, appearances, pass accuracy) filling up.
4. Fixtures & results: tabbed table (Fixtures / Results / League table). Tab switch animates rows in with stagger. Results show W/D/L pills coloured. League table highlights our row in lime.
5. Tickets: tier selector (General, Family, Premium, Hospitality) — selecting a tier updates a stadium SVG map, highlighting the matching seating zones with a glow, and updates price × quantity with an animated number.
6. Latest news: 3-card grid with image zoom on hover and category tags.
7. Shop teaser: kit on a slowly rotating 3D-ish tilt card (mouse-tilt with perspective), link "Visit club shop".
8. Sponsors marquee (fictional logos, greyscale → colour on hover). Footer with fixtures signup.

All data in data/*.json (squad of 18, 10 fixtures, 10 results, 20-team league table). Mobile: carousel becomes swipe, countdown stacks.

Done = a club site that feels like match day: splitting title, flipping countdown, flippable player stat cards, and a ticket selector that lights up stadium zones.
```

### Prompt 21 — Demo: MAISON ÉCRU (fashion e-commerce)

```
Build the MAISON ÉCRU demo at /showcase/fashion. A fictional contemporary clothing label. Design: editorial fashion magazine — restraint, huge serif, lots of whitespace, off-white paper feel.

Tokens: paper #F3EFE8, ink #151515, stone #9C958A, accent clay #B5654A (use very sparingly). Fonts: "Cormorant Garamond" (display, light italic for accents), "Inter Tight" (UI, small uppercase with wide tracking). spectrumColor #B5654A. Slower, heavier Lenis (lerp 0.07).

Sections & interactions:
1. Hero: split-screen — left, the word "ÉCRU" set enormous (28vw) in Cormorant, letters revealing one by one with a vertical mask; right, a tall campaign image that slowly zooms (scale 1.1 → 1 over 6s). The collection name "Autumn / Winter 26 — Quiet Forms" in small caps.
2. Image-trail lookbook: over a blank section with the line "Move to discover", moving the cursor leaves a trail of campaign images that pop in (scale 0.6 → 1, fade) and fade out after 0.8s, spawning every ~80px of mouse travel (the classic "image trail" effect). Mobile: auto-playing slideshow instead.
3. Horizontal drag lookbook: full-height images of varying widths, drag-scroll with inertia, each image slightly parallaxing inside its frame; captions with product names that link to product pages.
4. Shop (product listing page at /showcase/fashion/shop): grid with 12 products. Hover swaps the model shot for a flat-lay shot with a soft crossfade and a "Quick add" bar sliding up from the bottom of the image with size buttons. Filters sidebar (category, size, colour swatches, price range slider) — filtering uses Flip.
5. Product page (/showcase/fashion/product/[id]): left, vertical stack of images that scroll; right, sticky panel with name, price, colour swatches (changing colour crossfades images), size picker with a "size guide" modal, accordion (details, fabric & care, shipping), "Add to bag" button that, on click, animates a thumbnail flying into the bag icon (FLIP from button to header icon) and bumps the bag count.
6. Slide-out cart drawer: line items with quantity steppers, subtotal updating with animated numbers, free-shipping progress bar, checkout button (goes to a "Concept build — checkout disabled" message).
7. Editorial "Journal" block: a magazine-style asymmetric layout with drop caps.
8. Newsletter footer with an underline-only input.

Cart state in a zustand store persisted to localStorage (try/catch). Data in data/products.json.

Done = a store that feels like a fashion magazine, with an image-trail lookbook, hover-swap product cards, working filters, product page, and a cart that items fly into.
```

### Prompt 22 — Demo: Ember & Salt (restaurant)

```
Build the Ember & Salt demo at /showcase/restaurant. A fictional wood-fire restaurant. Design: warm, dark, moody, tactile.

Tokens: charred #14110F, ember #E2622B (accent), cream #EFE4D2, ash #6F665C. Fonts: "Fraunces" (display, soft optical sizing), "DM Sans" (body). Paper-grain texture overlay at 6% opacity. spectrumColor #E2622B.

Sections & interactions:
1. Hero: close-up fire/food video loop (or photo) with a WebGL smoke/heat-haze shader layered on top (distort UVs with rising noise, strongest near the bottom). Title "Cooked by fire. Served with care." with words revealing and a slight warm glow text-shadow that flickers.
2. Story: pinned section where three photos (farm, fire, plate) stack and each new one slides up over the previous as you scroll, with a short line of copy each.
3. Menu: category tabs (Starters, From the Fire, Sides, Desserts, Drinks) with a sliding ember-coloured indicator. Dishes listed as elegant rows (name ...... price with dot leaders). Hovering a dish row shows a round photo of the dish that follows the cursor with lag and rotates slightly with mouse velocity. Dietary icons (V, VG, GF) with tooltips.
4. Chef's feature: large portrait with quote; the quote text colour fills from ash to cream word by word as you scroll (scrub).
5. Reservation flow (the business feature): step 1 party size (stepper), step 2 date (custom calendar, past dates disabled, closed Mondays), step 3 time slots (generated for lunch/dinner, some randomly "fully booked" greyed out), step 4 name/phone/requests, step 5 confirmation with an animated check and a reservation summary card. Step transitions slide horizontally; progress indicator at top.
6. Gallery: masonry of food photos with gentle scale on hover.
7. Info: opening hours table (today's row highlighted automatically), address with a styled static map, reviews carousel.
8. Footer with a subtle animated flame SVG.

Done = a moody, warm restaurant site with heat-haze hero, cursor-following dish photos on the menu, and a working multi-step reservation flow.
```

### Prompt 23 — Demo: Stackwise (SaaS product)

```
Build the Stackwise demo at /showcase/saas. A fictional project-management SaaS. Design: modern product site, dark mode, crisp.

Tokens: bg #0A0B10, surface #12141C, border rgba(255,255,255,0.08), text #EDEEF3, muted #8A8FA3, accent violet #7C5CFF with a violet→cyan gradient for highlights. Fonts: "Geist" or "Inter" (UI), "Geist Mono" (code). spectrumColor #7C5CFF.

Sections & interactions:
1. Hero: headline with a gradient-shimmer highlighted word, two CTAs, and a large product dashboard mockup (built in HTML/CSS, not an image — real-looking kanban board). On scroll, the mockup rotates from rotateX(25deg) perspective tilt to flat (scrub), like it's being laid down in front of you. A soft animated gradient glow behind it.
2. Logo cloud marquee (fictional companies).
3. Bento feature grid (6 tiles of different sizes). Each tile has a live micro-demo: tasks auto-moving between kanban columns; a chart drawing itself; notifications stacking in; a command palette typing a query; avatars joining a cursor-presence demo; a timeline bar extending. Tiles have a mouse-tracking border glow (radial gradient border following cursor, the "spotlight card" effect).
4. Interactive product tour: vertical tabs on the left (Plan, Track, Automate, Report); the right side shows the product mockup and swaps content with a crossfade + slight scale; auto-advances every 5s with a progress bar on the active tab.
5. Integrations: an orbit — central Stackwise logo with integration icons orbiting in two rings at different speeds; hover pauses the orbit and shows the integration name.
6. Pricing: Monthly/Yearly toggle (yearly shows "−20%" badge); prices animate with a number roll. Three tiers, middle one "Most popular" with gradient border. Feature comparison table below, collapsible.
7. Testimonials: two rows of cards scrolling in opposite directions.
8. FAQ accordion with smooth height animation (animate grid-template-rows 0fr → 1fr).
9. Final CTA with a gradient mesh background slowly animating.

Done = a polished SaaS landing page with a tilting product mockup, live bento micro-demos, spotlight card borders, a product tour, orbiting integrations and a working pricing toggle.
```

### Prompt 24 — Demo: Harbor & Stone (real estate)

```
Build the Harbor & Stone demo at /showcase/real-estate. A fictional premium real estate agency. Design: calm, architectural, luxurious.

Tokens: bone #F5F3EF, charcoal #1E1E1C, sand #C8B8A0, deep green #2F3E36 (accent). Fonts: "Playfair Display" (display), "Manrope" (body). spectrumColor #2F3E36.

Sections & interactions:
1. Hero: full-screen property slideshow; transitions between properties use a clip-path wipe (inset from right) with the outgoing image scaling slightly — slow, 1.4s. Property name, location and price overlaid with line-mask text reveals synced to each slide. Search bar floating at the bottom: location, type, price range, beds — submit goes to listings.
2. Featured properties: horizontal cards; hover reveals a second photo and slides up key facts (beds, baths, m²).
3. Listings page (/showcase/real-estate/listings): split view — scrollable list on the left, map on the right (use a styled static SVG city map with positioned pins, no external map API). Hovering a listing highlights its pin (pin scales and turns green); clicking a pin scrolls the list to the card. Filters: price range dual slider, beds, baths, property type, with live result count animating.
4. Property detail page: gallery with fullscreen lightbox (swipe/keys), sticky enquiry card, specs grid, floor plan image with zoom-on-hover lens, neighbourhood section with distance-to icons.
5. Mortgage calculator: sliders for price, deposit %, interest rate, term; monthly payment animates as a number roll; a donut chart splits principal vs interest and animates on change.
6. Agents: team portraits in greyscale turning colour on hover.
7. "Sell with us" CTA with valuation form (address, property type, contact).

Done = a premium agency site with cinematic property transitions, a list+map search that syncs hover states, detail pages, and a live mortgage calculator.
```

### Prompt 25 — Demos, Tier 2 (run one at a time)

```
Build the following demos following the same structure as previous demo prompts (own tokens, fonts, demo.config.ts, data JSON, DemoFrame, mobile fallbacks, reduced motion). Build ONE per session; I'll tell you which.

A) Clearwell Clinic — /showcase/healthcare
   Tokens: white, mist #EEF5F4, teal #1F7A74 (accent), slate #2B3A42. Fonts: "Nunito Sans". Rounded corners 16px. Motion: only gentle — soft fade-ups, a slowly breathing gradient blob in the hero, no WebGL, no custom cursor. This demo proves we can do calm and accessible.
   Features: doctor directory with specialty filter + search; appointment booking wizard (department → doctor → date/time slot → patient details → confirmation); services grid; insurance accepted list; accessibility toolbar (text size +/−, high-contrast mode, reduce motion toggle) that actually works site-wide; WCAG AA contrast everywhere.

B) PULSE Athletics — /showcase/fitness
   Tokens: black #070707, neon #C6FF00 or hot pink #FF2E63 (pick one), grey #1A1A1A. Fonts: "Bebas Neue", "Inter". Motion: aggressive — headlines stretch vertically (scaleY) with scroll velocity, marquee of class names, video hero of training.
   Features: weekly timetable grid with filter by class type/trainer (Flip animations); membership plan comparison with toggle; BMI + daily calorie calculator with animated gauge; trainer profiles with hover video.

C) Casa Solenne — /showcase/hotel
   Tokens: limestone #F2EADF, terracotta #C4673F, sea #2E5E6E, ink #22201D. Fonts: "Cormorant", "Jost". Motion: the whole site's palette shifts from morning (warm light) to night (deep blue, warm lamps) as you scroll through the page (interpolate CSS variables with ScrollTrigger); horizontal room gallery.
   Features: booking widget with date-range picker, guests, room type, and a live price breakdown (nights × rate + taxes); room detail pages; experiences carousel; restaurant & spa sections.

D) Ledgerly — /showcase/fintech
   Tokens: navy #0D1B2A, white, mint #3DDC97 (accent), grey #E6EAF0. Fonts: "Sora", "IBM Plex Mono" for numbers. Motion: precise — a 3D payment card that tilts with the mouse and flips on click; charts drawing in; numbers counting with tabular figures.
   Features: savings/loan calculator with an animated growth chart (use recharts or d3); account types comparison; multi-step signup flow UI with validation and a progress stepper; security section with animated lock/shield icons.

E) Whitmore & Crane — /showcase/corporate
   Tokens: ivory #FAF8F3, oxford #14213D, brass #A8894F (accent). Fonts: "Libre Caslon Text", "Source Sans 3". Motion: minimal and dignified — hairline rules drawing in, slow text reveals, elegant fade page transitions. Proves we can do "serious".
   Features: practice areas with detail pages; team directory with filter by practice and office, bio pages; insights/articles list with category filter; contact form with office selector and a map per office.

Done (per demo) = a distinct, fully clickable site whose look shares nothing with the others, with its business feature working end to end.
```

### Prompt 26 — Demos, Tier 3 (run one at a time)

```
Same structure as before. Build ONE per session.

A) Brightpath Academy — /showcase/education
   Friendly, colourful, illustrated (use simple geometric SVG characters). Fonts: "Baloo 2", "Nunito". Features: course catalogue with filters (level, subject, duration), course page with curriculum accordion and instructor card, enrolment flow, progress-bar animations, a mini quiz widget.

B) Veloce Motors — /showcase/automotive
   Dark, cinematic. Fonts: "Michroma" (display), "Inter". Signature: 360° car viewer — an image sequence (36 frames) scrubbed by horizontal drag with inertia (cursor "drag"). Features: inventory with filters, configurator (paint colour swaps image set, wheels, trim) with live price, test-drive booking.

C) SIGNAL Summit 2027 — /showcase/event
   Experimental, grid-breaking, oversized type. Fonts: "Space Grotesk". Signature: kinetic typography hero where letters respond to cursor proximity (repel/scale). Features: agenda with day tabs and track filters, speaker grid with hover portrait reveal, ticket selection, countdown.

D) Brightline Home Services — /showcase/local-services
   Practical, bold, trustworthy. Fonts: "Poppins". Minimal motion. Must score 95+ Lighthouse on mobile. Features: instant quote estimator (service type, size, urgency → price range), service-area checker by postcode, before/after sliders, reviews with star ratings, sticky click-to-call bar on mobile, WhatsApp button.

E) Open Harvest — /showcase/nonprofit
   Human, photography-led, warm. Fonts: "Merriweather", "Lato". Signature: pinned scroll story where a photo narrative advances with captions. Features: donation widget (preset amounts, custom, monthly/one-off toggle, impact message that changes with amount — "$50 feeds a family for a week"), impact counters, volunteer signup.

Done (per demo) = distinct, working, mobile-friendly concept site.
```

### Prompt 27 — Preview videos, thumbnails & quality gate

```
Automate the showcase assets and quality checks.

1) scripts/capture-previews.ts using Playwright: for each demo in the registry, launch at 1440×900, open the demo URL, wait for load, record an 8-second video while programmatically scrolling (smooth, eased) through the top of the page and hovering the signature interaction; save as public/showcase/<slug>/preview.mp4 (H.264, muted, ≤ 1.5 MB — transcode with ffmpeg: crf 28, 30fps, width 960). Also save a poster.jpg from the first frame and an og.jpg (1200×630) for social sharing.

2) scripts/audit-demos.ts: run Lighthouse (mobile) on every demo, write scores to src/data/showcase-scores.json (read by the Specs drawer). Fail the script if any demo scores below: performance 75 (local services and healthcare: 90), accessibility 90.

3) Add both scripts to package.json and a README section explaining how to add a new demo end to end: generate → build → capture previews → audit → it appears in /showcase automatically.

Done = running `npm run showcase:assets` produces preview videos, posters, OG images and a scores file for all demos.
```

## D6. Recommended build order

1. Prompt 19 (frame + scaffolding) — so every demo starts consistent.
2. Tier 1 demos: Fashion, SaaS, Restaurant, Sports, Real estate (Prompts 20–24). Five strong demos are enough to launch the showcase.
3. Prompt 18 (the Prism index) — build it once there are 5 beams to show.
4. Prompt 27 (previews + audit).
5. Tier 2, then Tier 3, added over time. Each new demo is a new beam in the prism, so the showcase visibly grows — good content for LinkedIn posts ("New concept: hotel booking site").

## D7. Things to settle with your manager

- **Imagery licensing:** use royalty-free sources (Unsplash, Pexels) or AI-generated images you have rights to. Keep a CREDITS.md per demo. No real brand logos, real athletes, or real products in any demo.
- **Fictional names:** quickly search each fictional brand name before launch to make sure it isn't a real business in your market.
- **Sales hook:** the "Get a site like this" button in each demo's Specs drawer should feed the contact form with the demo slug, so you can track which industries generate leads and build more demos in those.
- **Pricing tie-in (optional):** each demo could map to a package (e.g. "Local services demo = Starter package", "Fashion = E-commerce package"), shown in the Specs drawer.

---
---

# Part E — Upgrading an existing build (the project is already in progress)

Use this part instead of running Prompts 0–27 blindly. The goal is to **layer** the effects from this brief onto what already exists, not to rebuild it. Run E0 first, always.

## Prompt E0 — Audit & gap report (run this first, no code changes)

```
Do NOT modify any code in this task. This is an audit only.

Read MOTION_BRIEF.md fully (Parts A–D). Then inspect this repository: package.json, framework and router, styling approach, animation libraries in use, folder structure, every route/page, every section and component, global layout, fonts, and colour tokens.

Produce UPGRADE_PLAN.md containing:

1. CURRENT STATE
   - Stack summary (framework, styling, animation libs, smooth scroll, WebGL, state).
   - Page and section inventory: a table of every page → sections on it → what motion (if any) each section currently has.
   - Brand compliance check: list any colours, fonts or radii that don't match the tokens in Part A, with file paths and line numbers.

2. GAP MAP
   - For each effect in the Part A inventory (1–16) and the Showcase (Part D): status = Done / Partial / Missing / Not applicable, with a one-line note and the file where it lives or should live.

3. STACK ADAPTATION
   - Where our actual stack differs from the brief's assumptions (e.g. we use Framer Motion instead of GSAP, Vite instead of Next.js, CSS modules instead of Tailwind), state how each effect should be implemented WITH OUR EXISTING STACK. Do not recommend replacing libraries that already work unless there's a hard technical reason (e.g. SplitText-quality letter animation or pinned scrub scenes are much easier with GSAP — if so, recommend adding GSAP alongside, not replacing).

4. RISKS & DEBT
   - Anything that will fight the upgrades: animations not cleaned up on unmount, multiple scroll listeners, layout-shifting animations (width/height/top/left), missing reduced-motion handling, huge images, hydration issues.

5. UPGRADE BACKLOG
   - A prioritised list of upgrades, each with: ID (U01, U02...), what, where (files), which brief effect it comes from, impact (High/Med/Low), effort (S/M/L), dependencies.
   - Order by impact ÷ effort, with foundation items (motion tokens, smooth scroll, cleanup fixes) first.

Stop after writing UPGRADE_PLAN.md and give me a 10-line summary. Wait for me to approve which IDs to build.
```

## Prompt E1 — Motion system retrofit (foundation, usually U01)

```
Implement the motion foundation into the EXISTING codebase without changing any visuals yet.

- Create a single motion config (src/lib/motion.ts or equivalent for our stack) exporting: eases ("illumia.out" = cubic-bezier(0.16,1,0.3,1), "illumia.inOut" = cubic-bezier(0.76,0,0.24,1)), durations (micro 0.25, ui 0.6, reveal 1.0, page 0.55), stagger values (chars 0.018, words 0.04, items 0.08).
- If GSAP is used: register CustomEase with those curves. If Framer Motion is used: export them as transition presets. Also expose them as CSS variables (--ease-out, --ease-in-out, --dur-*) for CSS transitions.
- Find every existing animation/transition in the codebase and replace ad-hoc timings and eases with these tokens. List every file changed.
- Add smooth scrolling with Lenis if not present (single instance, synced with the animation library's ticker and scroll triggers if any). Disable on reduced motion and touch-only devices if it causes issues.
- Add a global reduced-motion hook and wire it into every existing animated component.
- Fix any cleanup issues found in UPGRADE_PLAN.md (animations not killed on unmount/route change).

Done = the site looks the same, but every animation now uses shared tokens, scroll is smooth, and reduced motion is respected everywhere.
```

## Prompt E2 — Upgrade template for any single effect

Use this to pull any effect from Parts A–D into the existing site. Fill in the brackets.

```
Implement upgrade [U-ID] from UPGRADE_PLAN.md: [effect name] as described in MOTION_BRIEF.md [Prompt number / section].

Constraints:
- Integrate into the existing [component/section name] at [file path]. Keep its current content, props and layout; add the motion on top.
- Use our existing stack and the motion tokens from src/lib/motion.ts. Adapt the brief's GSAP/Next.js instructions to our stack where they differ.
- Build the effect as a reusable component/hook in the motion folder, then apply it. Don't inline one-off animation code in sections.
- Must handle: reduced motion, mobile/touch fallback described in the brief, cleanup on unmount, no layout shift.
- Don't touch unrelated files. If you must change a shared file, tell me why.

When finished: list files created/changed, tell me which route to open to see it, and list the 3 values I'm most likely to want to tune (with their current numbers).
```

## Prompt E3 — Section-by-section upgrade pass

Run once per page. It upgrades what's already there using the brief's vocabulary.

```
Do an upgrade pass on the [page name] page ([route]). For each existing section, apply the relevant upgrades below where they fit. Skip any that don't suit the section's content, and tell me why you skipped them.

HERO
- Headline → CharRise (masked char rise), one highlighted word in crimson with underline draw.
- Eyebrow → Decode effect.
- Background → Beacon glow (WebGL if the hero is the page's main moment, CSS radial + grain otherwise) with inertial cursor follow.
- Add scroll hint (mono SCROLL + travelling line).
- On scroll out: hero content parallaxes up at 0.6× and fades.

SECTION HEADINGS
- Eyebrow line-draw + decode, heading CharRise on scroll (once).

BODY TEXT
- Paragraphs fade up by line (SplitText lines, stagger 0.06). Keep it subtle.
- Any key statement paragraph → scroll-scrubbed word colour fill (muted → full colour).

CARDS / GRIDS
- Staggered reveal (y 40 → 0, opacity), 0.08 stagger.
- Hover: lift −6px, shadow deepens, border glow following the cursor (spotlight card).
- Images inside cards: clip-path reveal + scale 1.2 → 1, and inner parallax.

IMAGES (standalone)
- Clip-path wipe reveal on scroll; parallax inside the frame.

CTAs / BUTTONS
- MagneticButton with directional crimson fill and RollText label.

LISTS OF LOGOS / TECH / CLIENTS
- Convert to VelocityMarquee.

STATS / NUMBERS
- Count-up with crimson suffix landing last.

SECTION BOUNDARIES
- Dark↔light ThemeMorph between sections (background, text, nav and cursor re-colour together).
- Where a section is the page's big statement, consider a pinned scrubbed moment (sunrise, spotlight reveal, or horizontal track).

Report a before/after list per section.
```

## Prompt E4 — Global layer upgrades (site-wide, high impact)

```
Add these site-wide layers to the existing layout, adapting to our stack. Build them one at a time and stop after each for review:

1. Grain overlay: fixed full-screen, pointer-events none, SVG feTurbulence noise at 4–6% opacity, animated position jitter at 8fps. (Biggest "premium" upgrade per minute of work.)
2. Custom diamond cursor with contextual states (Brief Prompt 5), desktop only.
3. Page transitions (Brief Prompt 7). If our router doesn't allow intercepting navigation easily, use the View Transitions API with a diamond clip-path animation in CSS as the transition.
4. Header upgrades: hide on scroll down / show on scroll up, blur after 80px, logo swaps light/dark with ThemeMorph, menu button morphs into a diamond X, full-screen menu overlay (Brief Prompt 14).
5. Scroll progress line (2px crimson, top).
6. Footer: curtain reveal + giant wordmark with cursor light sweep (Brief Prompt 15).
7. Preloader (Brief Prompt 1) — LAST, only once the rest is solid, since it gates the first impression.
```

## Stack translation cheatsheet (for Claude Code when our stack differs)

| Brief assumes | If you're using… | Use instead |
|---|---|---|
| GSAP ScrollTrigger (scrub, pin) | Framer Motion / Motion | `useScroll` + `useTransform` for scrub; `position: sticky` + scroll progress for pins. For complex pinned horizontal scenes, add GSAP alongside. |
| GSAP SplitText | Framer Motion | Split text manually into spans (or use `splitting` / SplitText standalone) and animate with `variants` + `staggerChildren`. |
| GSAP Flip | Framer Motion | `layout` prop + `LayoutGroup` + `AnimatePresence`. |
| Next.js TransitionLink | React Router / Vite | Wrap `useNavigate`; play cover animation, navigate, then reveal on location change. Or View Transitions API. |
| Next.js App Router route groups for demos | Any other router | Separate layout component per demo that scopes tokens under `[data-demo="slug"]` and loads fonts only on that route. |
| Astro | Astro | Astro's built-in `<ViewTransitions />` for page transitions; GSAP/Lenis in client scripts; React islands for WebGL. |
| React Three Fiber | Plain Three.js / OGL | Same shaders; OGL is lighter if bundle size matters. |
| Lenis | anything | Lenis is framework-agnostic; keep it. |

## Safety net for upgrades

```
For every upgrade:
- Work on a branch named upgrade/<U-ID>.
- Before changes, capture Playwright screenshots of affected routes at 1440 and 390 widths into /qa/before/<U-ID>/; after changes, into /qa/after/<U-ID>/.
- Run the build and lint; fix errors before reporting done.
- Check performance didn't drop more than 5 Lighthouse points on the affected route.
```

## Quick wins — most "wow" per hour, if you want momentum today

1. Grain overlay (E4.1)
2. Lenis smooth scroll + motion tokens (E1)
3. CharRise on every heading + Decode on eyebrows (Brief Prompt 3)
4. Magnetic CTAs with directional fill (Brief Prompt 6)
5. Custom diamond cursor (Brief Prompt 5)
6. Tech-stack velocity marquee (Brief Prompt 10)
7. Footer wordmark light sweep (Brief Prompt 15)
8. Diamond page transitions (Brief Prompt 7)
