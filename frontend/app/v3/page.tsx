"use client";

import { useEffect, useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { magnetic, countUp } from "@/components/motion/effects";
import { gsap, ScrollTrigger, SplitText, useGSAP, ease, reducedMotion, finePointer } from "@/lib/gsap";
import { agile, intro, ownership, pages, process, services, stack, stats } from "@/lib/copy";
import { useMotionOn } from "./Shell";

/* three acts of the seven-stage cycle: where it starts, where it is built, and how it comes back round */
const chapters = [process[0], process[3], process[6]].map((p) => ({ word: p.name, body: p.body }));

export default function KineticHome() {
  const root = useRef<HTMLDivElement>(null);
  const loops = useRef<gsap.core.Tween[]>([]);
  const motionOn = useMotionOn();

  useEffect(() => {
    loops.current.forEach((l) => (motionOn ? l.play() : l.pause()));
  }, [motionOn]);

  useGSAP(
    () => {
      const el = root.current!;
      countUp(el);
      const offMag = magnetic(el, "[data-magnetic]", 0.5);
      if (reducedMotion()) return offMag;

      /* on a phone the widest cut no longer fits a word to the screen, so letters stretch to 100 */
      const WIDE = window.matchMedia("(max-width: 760px)").matches ? 100 : 125;

      /* --- hero: each letter stretches from condensed to wide, row by row (words keep their letters together) --- */
      const rows = gsap.utils.toArray<HTMLElement>(".v3-hero__row");
      const splits = rows.map((r) => SplitText.create(r, { type: "words,chars", charsClass: "k" }));
      const chars = splits.flatMap((s) => s.chars as HTMLElement[]);
      gsap.set(chars, { "--w": 62, "--wg": 300, yPercent: 100, autoAlpha: 0 });
      gsap.set([".v3-hero__sub", ".v3-hero__cta"], { autoAlpha: 0, y: 30 });
      const offEnter = onPageEnter("v3", () =>
        gsap
          .timeline()
          .to(chars, { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.025, ease: ease.out })
          .to(chars, { "--w": WIDE, "--wg": 900, duration: 1.1, stagger: 0.025, ease: "power3.inOut" }, 0.15)
          .to([".v3-hero__sub", ".v3-hero__cta"], { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: ease.out }, 0.6),
      );

      /* pointer proximity: letters near the pointer squeeze and lighten */
      let offProx = () => {};
      if (finePointer()) {
        const hero = el.querySelector<HTMLElement>(".v3-hero")!;
        const setters = chars.map((c) => ({
          c,
          w: gsap.quickTo(c, "--w", { duration: 0.6, ease: "power3.out" }),
          g: gsap.quickTo(c, "--wg", { duration: 0.6, ease: "power3.out" }),
        }));
        const prox = (e: PointerEvent) => {
          setters.forEach(({ c, w, g }) => {
            const r = c.getBoundingClientRect();
            const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
            const k = gsap.utils.clamp(0, 1, 1 - d / 320);
            w(125 - k * 63);
            g(900 - k * 600);
          });
        };
        const reset = () => setters.forEach(({ w, g }) => { w(125); g(900); });
        hero.addEventListener("pointermove", prox);
        hero.addEventListener("pointerleave", reset);
        offProx = () => {
          hero.removeEventListener("pointermove", prox);
          hero.removeEventListener("pointerleave", reset);
        };
      }

      /* the whole headline squeezes as you scroll past it */
      gsap.to(".v3-hero__title", {
        scaleY: 0.6, yPercent: -10, transformOrigin: "50% 0%", ease: "none",
        scrollTrigger: { trigger: ".v3-hero", start: "top top", end: "bottom top", scrub: true },
      });

      /* --- chapters: one pinned stage, three acts, the field changes colour each act --- */
      const acts = gsap.utils.toArray<HTMLElement>(".v3-act");
      // later acts wait below their masks; set here (not in CSS) so GSAP owns the transform
      acts.slice(1).forEach((a) => {
        gsap.set(a.querySelector(".v3-act__word"), { yPercent: 100 });
        gsap.set(a.querySelector(".v3-act__body"), { autoAlpha: 0 });
      });
      const stage = gsap.timeline({
        scrollTrigger: { trigger: ".v3-chapters", start: "top top", end: "+=220%", pin: true, scrub: 0.6 },
      });
      const fields = ["#1f1f25", "#b41f3c", "#f4f5f7"];
      const inks = ["#ffffff", "#ffffff", "#1f1f25"];
      acts.forEach((a, i) => {
        if (i > 0) {
          stage
            .to(acts[i - 1].querySelector(".v3-act__word"), { yPercent: -100, "--w": 62, duration: 1, ease: "power2.in" })
            .to(acts[i - 1].querySelector(".v3-act__body"), { autoAlpha: 0, y: -30, duration: 0.6 }, "<")
            .to(".v3-chapters", { backgroundColor: fields[i], color: inks[i], duration: 1 }, "<")
            .fromTo(a.querySelector(".v3-act__word"), { yPercent: 100, "--w": 62 }, { yPercent: 0, "--w": WIDE, duration: 1, ease: "power2.out" }, "-=0.3")
            .fromTo(a.querySelector(".v3-act__body"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "<0.3");
        }
        stage.to(".v3-chapters__bar i", { scaleX: (i + 1) / acts.length, duration: 0.5 }, "<");
        stage.to({}, { duration: 0.6 }); // hold each act
      });

      /* --- services: cards stack, the one beneath shrinks back --- */
      const cards = gsap.utils.toArray<HTMLElement>(".v3-card");
      cards.forEach((c, i) => {
        if (i === cards.length - 1) return;
        gsap.to(c, {
          scale: 0.88, rotate: i % 2 ? 1.5 : -1.5, ease: "none",
          scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 20%", scrub: true },
        });
      });

      /* --- work rail: drag or scroll; cards lean with speed --- */
      const rail = el.querySelector<HTMLElement>(".v3-rail__track")!;
      const railWrap = el.querySelector<HTMLElement>(".v3-rail")!;
      const max = () => Math.max(0, rail.scrollWidth - railWrap.clientWidth);
      const railX = gsap.quickTo(rail, "x", { duration: 0.9, ease: "power3.out" });
      let x = 0;
      let dragging = false;
      let startX = 0;
      let startOff = 0;
      let lastX = 0;
      const down = (e: PointerEvent) => {
        dragging = true;
        startX = lastX = e.clientX;
        startOff = x;
        railWrap.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        x = gsap.utils.clamp(-max(), 0, startOff + (e.clientX - startX) * 1.4);
        railX(x);
        gsap.to(".v3-rail__card", { skewX: gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4), duration: 0.4, overwrite: "auto" });
        lastX = e.clientX;
      };
      const up = () => {
        dragging = false;
        gsap.to(".v3-rail__card", { skewX: 0, duration: 0.8, ease: ease.out });
      };
      railWrap.addEventListener("pointerdown", down);
      railWrap.addEventListener("pointermove", move);
      railWrap.addEventListener("pointerup", up);
      railWrap.addEventListener("pointercancel", up);
      gsap.from(".v3-rail__card", {
        xPercent: 40, autoAlpha: 0, stagger: 0.08, duration: 1.1, ease: ease.out,
        scrollTrigger: { trigger: railWrap, start: "top 80%" },
      });

      /* --- ticker of the stack, paused by the Pause motion control --- */
      loops.current = [gsap.to(".v3-ticker__track", { xPercent: -50, duration: 24, ease: "none", repeat: -1 })];

      /* --- stat blocks pop up from their baseline --- */
      gsap.from(".v3-stat", {
        yPercent: 30, autoAlpha: 0, stagger: 0.08, duration: 1, ease: ease.out,
        scrollTrigger: { trigger: ".v3-stats", start: "top 80%" },
      });

      /* --- final call: the words squeeze in as they arrive --- */
      const cta = SplitText.create(".v3-cta__title", { type: "words,chars", charsClass: "k" });
      gsap.fromTo(cta.chars, { "--w": 62, autoAlpha: 0 }, {
        "--w": WIDE, autoAlpha: 1, stagger: 0.03, duration: 1, ease: ease.out,
        scrollTrigger: { trigger: ".v3-cta", start: "top 70%" },
      });

      return () => {
        offMag();
        offEnter();
        offProx();
        railWrap.removeEventListener("pointerdown", down);
        railWrap.removeEventListener("pointermove", move);
        railWrap.removeEventListener("pointerup", up);
        railWrap.removeEventListener("pointercancel", up);
        ScrollTrigger.refresh();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v3-page">
      {/* HERO */}
      <section className="v3-hero" aria-labelledby="v3-title">
        <h1 id="v3-title" className="v3-hero__title">
          <span className="v3-hero__kicker">{intro.title[0]}</span>
          <span className="v3-hero__row">{intro.title[1]}</span>
          <span className="v3-hero__row">{intro.title[2].split(" ")[0]}</span>
          <span className="v3-hero__row v3-hero__row--accent">{intro.title[2].split(" ").slice(1).join(" ")}</span>
        </h1>
        <div className="v3-hero__foot">
          <p className="v3-hero__sub">{intro.lede}</p>
          <div className="v3-hero__cta">
            <TLink href="/v3/contact" className="v3-blob" data-magnetic label="Contact">{pages.hero.primary}</TLink>
            <TLink href="/v3/services" className="v3-pill" label="Services">{pages.hero.secondary}</TLink>
          </div>
        </div>
      </section>

      {/* CHAPTERS */}
      <section className="v3-chapters" aria-labelledby="v3-ch-title">
        <h2 id="v3-ch-title" className="sr-only">{pages.processHead.title}</h2>
        <div className="v3-chapters__stage">
          {chapters.map((c, i) => (
            <div key={c.word} className="v3-act" data-first={i === 0}>
              <p className="v3-act__mask" aria-hidden={i > 0}><span className="v3-act__word">{c.word}</span></p>
              <p className="v3-act__body">{c.body}</p>
            </div>
          ))}
        </div>
        <div className="v3-chapters__bar" aria-hidden="true"><i /></div>
      </section>

      {/* SERVICES STACK */}
      <section className="v3-services" aria-labelledby="v3-svc-title">
        <div className="v3-head">
          <h2 id="v3-svc-title">{pages.servicesHead.title}</h2>
          <TLink href="/v3/services" className="v3-pill" label="Services">All four services</TLink>
        </div>
        <div className="v3-stack">
          {services.map((s, i) => (
            <article key={s.slug} className={`v3-card v3-card--${i % 3}`}>
              <p className="v3-card__tag">0{i + 1} · {s.tag}</p>
              <h3>{s.name}</h3>
              <p className="v3-card__promise">{s.promise}</p>
              <p>{s.short}</p>
              <ul role="list">{s.highlights.map((t) => <li key={t}>{t}</li>)}</ul>
              <TLink href={`/v3/services/${s.slug}`} className="v3-pill" label={s.name}>Read more</TLink>
            </article>
          ))}
        </div>
      </section>

      {/* OWNERSHIP RAIL */}
      <section className="v3-work" aria-labelledby="v3-work-title">
        <div className="v3-head">
          <h2 id="v3-work-title">{pages.ownershipHead.title}</h2>
          <TLink href="/v3/process" className="v3-pill" label="Process">How we work</TLink>
        </div>
        <div className="v3-rail" data-cursor="Drag" data-lenis-prevent-touch>
          <div className="v3-rail__track">
            {ownership.map((o) => (
              <article key={o.name} className="v3-rail__card">
                <div className="v3-rail__cover v3-rail__cover--file">
                  <pre aria-hidden="true">{o.snippet.map((l) => <code key={l}>{l}</code>)}</pre>
                </div>
                <h3>{o.name}</h3>
                <p>{o.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="v3-stats" aria-labelledby="v3-stats-title">
        <h2 id="v3-stats-title" className="v3-stats__title">The short version</h2>
        <dl className="v3-stats__grid">
          {stats.map((s, i) => (
            <div key={s.label} className={`v3-stat v3-stat--${i}`}>
              <dd><span data-count={s.value}>{s.value}</span>{s.suffix}</dd>
              <dt>{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* AGILE */}
      <section className="v3-agile" aria-labelledby="v3-agile-title">
        <div className="v3-head">
          <h2 id="v3-agile-title">{agile.title}</h2>
        </div>
        <p className="v3-agile__lede">{agile.body}</p>
        <div className="v3-agile__grid">
          {agile.points.map((x, i) => (
            <article key={x.name} className={`v3-agile__card v3-card--${i % 3}`}>
              <h3>{x.name}</h3>
              <p>{x.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* STACK TICKER */}
      <section className="v3-ticker" aria-label="Technologies we use">
        <ul className="sr-only">{stack.map((p) => <li key={p}>{p}</li>)}</ul>
        <div className="v3-ticker__track" aria-hidden="true">
          {[...stack, ...stack].map((p, i) => <span key={i}>{p}</span>)}
        </div>
      </section>

      {/* CTA */}
      <section className="v3-cta" aria-labelledby="v3-cta-title">
        <h2 id="v3-cta-title" className="v3-cta__title">{pages.footer.ask}</h2>
        <p>{intro.philosophy}</p>
        <TLink href="/v3/contact" className="v3-blob v3-blob--big" data-magnetic label="Contact">{pages.footer.cta}</TLink>
      </section>
    </div>
  );
}
