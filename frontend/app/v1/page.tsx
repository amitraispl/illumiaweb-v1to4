"use client";

import { useRef } from "react";
import { Beacon } from "./Beacon";
import { TLink } from "@/components/motion/Transition";
import { CodePane, sampleCode } from "@/components/ui/Fragments";
import { magnetic, directionalFill, countUp } from "@/components/motion/effects";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, ScrollTrigger, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { agile, buildLog, intro, ownership, pages, process, services, stack, stats } from "@/lib/copy";

export default function BeaconHome() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const offMag = magnetic(el, "[data-magnetic]");
      const offFill = directionalFill(el, ".v1-btn");
      countUp(el);
      if (reducedMotion()) return () => { offMag(); offFill(); };

      /* --- hero: lines rise, then the key line decodes from glyphs --- */
      const split = SplitText.create(".v1-hero h1 .line", { type: "words,chars", mask: "chars", charsClass: "ch" });
      gsap.set(split.chars, { yPercent: 110 });
      gsap.set([".v1-hero__sub", ".v1-hero__actions", ".v1-hero__meta"], { autoAlpha: 0, y: 24 });
      const offEnter = onPageEnter("v1", () => {
        gsap
          .timeline()
          .to(split.chars, { yPercent: 0, duration: 1, stagger: 0.025, ease: ease.out })
          .to(".v1-hero h1 .decode", { duration: 0.9, scrambleText: { text: "{original}", chars: "01<>/{}[]=#", revealDelay: 0.1, speed: 0.6 } }, 0.2)
          .to([".v1-hero__sub", ".v1-hero__actions", ".v1-hero__meta"], { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09, ease: ease.out }, 0.55);
      });

      /* --- spotlight: the cursor reveals the code hidden in the dark --- */
      const hero = el.querySelector<HTMLElement>(".v1-hero")!;
      const mx = gsap.quickTo(hero, "--mx", { duration: 0.5, ease: "power3.out" });
      const my = gsap.quickTo(hero, "--my", { duration: 0.5, ease: "power3.out" });
      const spot = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect();
        mx(e.clientX - r.left);
        my(e.clientY - r.top);
      };
      hero.addEventListener("pointermove", spot);

      /* hero sinks and dims as you leave it */
      gsap.to(".v1-hero__inner", {
        yPercent: 18, autoAlpha: 0.2, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });

      /* --- statement: each word lights up as it passes the beam --- */
      const words = SplitText.create(".v1-statement p", { type: "words" });
      gsap.fromTo(words.words, { opacity: 0.14 }, {
        opacity: 1, stagger: 0.05, ease: "none",
        scrollTrigger: { trigger: ".v1-statement", start: "top 75%", end: "bottom 55%", scrub: true },
      });

      /* --- services: pinned horizontal track --- */
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        const track = el.querySelector<HTMLElement>(".v1-track__rail")!;
        const dist = () => track.scrollWidth - window.innerWidth + 80;
        const tween = gsap.to(track, {
          x: () => -dist(), ease: "none",
          scrollTrigger: {
            trigger: ".v1-track", start: "top top", end: () => `+=${dist()}`,
            pin: true, scrub: 0.6, invalidateOnRefresh: true,
            onUpdate: (st) => gsap.set(".v1-track__progress i", { scaleX: st.progress }),
          },
        });
        gsap.utils.toArray<HTMLElement>(".v1-panel").forEach((p) => {
          gsap.from(p.querySelectorAll(".v1-panel__name, .v1-panel__body, .v1-panel li"), {
            y: 40, autoAlpha: 0, stagger: 0.05, duration: 0.8, ease: ease.out,
            scrollTrigger: { trigger: p, containerAnimation: tween, start: "left 75%" },
          });
        });
      });

      /* --- dark → light: the page switches on its lights for the process, and off again for proof.
         A timed flip, not a scrub, so the page never sits in a muddy half-grey. --- */
      const DARK = { "--v1-bg": "#1f1f25", "--v1-fg": "#ffffff", "--v1-dim": "#c9c9cf", "--v1-acc": "#e66a82", "--v1-card": "#26262d" };
      const LIGHT = { "--v1-bg": "#f4f5f7", "--v1-fg": "#26262b", "--v1-dim": "#55555c", "--v1-acc": "#b41f3c", "--v1-card": "#e9e9ee" };
      const tone = (v: typeof DARK) => gsap.to(el, { ...v, duration: 0.9, ease: "power2.inOut", overwrite: true });
      ScrollTrigger.create({ trigger: ".v1-process", start: "top 55%", onEnter: () => tone(LIGHT), onLeaveBack: () => tone(DARK) });
      ScrollTrigger.create({ trigger: ".v1-proof", start: "top 55%", onEnter: () => tone(DARK), onLeaveBack: () => tone(LIGHT) });

      /* the path to success draws as you read it */
      gsap.fromTo(".v1-process__path", { drawSVG: "0%" }, {
        drawSVG: "100%", ease: "none",
        scrollTrigger: { trigger: ".v1-process__list", start: "top 70%", end: "bottom 60%", scrub: true },
      });
      gsap.utils.toArray<HTMLElement>(".v1-step").forEach((s) => {
        gsap.from(s.children, {
          y: 28, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: ease.out,
          scrollTrigger: { trigger: s, start: "top 82%" },
        });
      });

      /* --- stack marquee: speed and lean follow scroll velocity --- */
      const rows = gsap.utils.toArray<HTMLElement>(".v1-marquee__row");
      const loops = rows.map((r, i) =>
        gsap.to(r, { xPercent: i % 2 ? 0 : -50, startAt: { xPercent: i % 2 ? -50 : 0 }, duration: 38, ease: "none", repeat: -1 }),
      );
      ScrollTrigger.create({
        trigger: ".v1-marquee", start: "top bottom", end: "bottom top",
        onUpdate: (st) => {
          const v = gsap.utils.clamp(-6, 6, st.getVelocity() / 300);
          loops.forEach((l) => gsap.to(l, { timeScale: 1 + Math.abs(v), duration: 0.3, overwrite: true }));
          gsap.to(rows, { skewX: -v * 1.2, duration: 0.4, overwrite: "auto" });
        },
      });

      /* --- ownership cards open from a diamond --- */
      gsap.utils.toArray<HTMLElement>(".v1-work__card").forEach((c, i) => {
        gsap.fromTo(c.querySelector(".v1-work__cover"),
          { clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)" },
          { clipPath: "polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)", duration: 1.4, ease: ease.wipe, delay: i * 0.08,
            scrollTrigger: { trigger: c, start: "top 85%" } });
        gsap.from(c.querySelectorAll(".v1-work__meta > *"), {
          y: 20, autoAlpha: 0, stagger: 0.06, duration: 0.7, ease: ease.out,
          scrollTrigger: { trigger: c, start: "top 80%" },
        });
      });

      /* --- proof: the build log types itself --- */
      const log = gsap.timeline({ scrollTrigger: { trigger: ".v1-log", start: "top 75%" } });
      gsap.utils.toArray<HTMLElement>(".v1-log__line").forEach((li) => {
        const text = li.dataset.text ?? "";
        li.textContent = "";
        gsap.set(li, { autoAlpha: 0 });
        log.set(li, { autoAlpha: 1 }).to(li, { duration: text.length * 0.018, text: { value: text }, ease: "none" });
      });

      return () => {
        offMag();
        offFill();
        offEnter();
        hero.removeEventListener("pointermove", spot);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v1-page">
      {/* HERO */}
      <section className="v1-hero" aria-labelledby="v1-title">
        <Beacon className="v1-hero__canvas" />
        <div className="v1-hero__code" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <pre key={i}>{sampleCode.join("\n")}</pre>
          ))}
        </div>
        <div className="v1-hero__inner">
          <p className="v1-eyebrow v1-hero__eyebrow">{intro.eyebrow}</p>
          <h1 id="v1-title">
            <span className="line">{intro.title[0]}</span>
            <span className="line">{intro.title[1]} <span className="decode">{intro.title[2]}</span></span>
          </h1>
          <p className="v1-hero__sub">{intro.lede}</p>
          <div className="v1-hero__actions">
            <TLink href="/v1/contact" className="v1-btn v1-btn--solid" data-magnetic label="Contact">
              <span>{pages.hero.primary}</span>
            </TLink>
            <TLink href="/v1/services" className="v1-btn" data-magnetic label="Services">
              <span>{pages.hero.secondary}</span>
            </TLink>
          </div>
          <dl className="v1-hero__meta">
            {stats.slice(0, 3).map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd><span data-count={s.value}>{s.value}</span>{s.suffix}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="v1-hero__hint" aria-hidden="true">Move the light</p>
      </section>

      {/* STATEMENT */}
      <section className="v1-statement" aria-label="Our philosophy">
        <p>{intro.philosophy}</p>
        <small className="v1-statement__by">{pages.philosophyBy}</small>
      </section>

      {/* SERVICES TRACK */}
      <section className="v1-track" aria-labelledby="v1-services-title">
        <div className="v1-track__head">
          <div>
            <p className="v1-eyebrow">01 · {pages.servicesHead.eyebrow}</p>
            <h2 id="v1-services-title">{pages.servicesHead.title}</h2>
          </div>
          <TLink href="/v1/services" className="v1-link" label="Services">All services</TLink>
        </div>
        <div className="v1-track__rail">
          {services.map((s, i) => (
            <article key={s.slug} className="v1-panel">
              <p className="v1-panel__tag">0{i + 1} · {s.tag}</p>
              <h3 className="v1-panel__name">{s.name}</h3>
              <p className="v1-panel__body">{s.short}</p>
              <ul role="list">
                {s.highlights.map((d) => <li key={d}>{d}</li>)}
              </ul>
              <TLink href={`/v1/services/${s.slug}`} className="v1-link v1-panel__more" label={s.name}>Read more</TLink>
            </article>
          ))}
        </div>
        <div className="v1-track__progress" aria-hidden="true"><i /></div>
      </section>

      {/* PROCESS (dark → light) */}
      <section className="v1-process" aria-labelledby="v1-process-title">
        <div className="v1-process__intro">
          <p className="v1-eyebrow">02 · {pages.processHead.eyebrow}</p>
          <h2 id="v1-process-title">{pages.processHead.title}</h2>
          <p>{pages.processPage.lede}</p>
          <div className="v1-process__code"><CodePane lines={sampleCode} title="deploy.ts" /></div>
        </div>
        <div className="v1-process__list">
          <svg className="v1-process__line" viewBox="0 0 10 600" preserveAspectRatio="none" aria-hidden="true">
            <path className="v1-process__path" d="M5 0 V600" />
          </svg>
          <ol>
            {process.map((p, i) => (
              <li key={p.name} className="v1-step">
                <div className="v1-step__head">
                  <h3>{p.name}</h3>
                  <span>{i === process.length - 1 ? `↺ ${pages.processPage.loop}` : `0${i + 1}`}</span>
                </div>
                <p>{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* STACK MARQUEE */}
      <section className="v1-marquee" aria-label="Technologies we use">
        <ul className="sr-only">{stack.map((t) => <li key={t}>{t}</li>)}</ul>
        {[0, 1].map((r) => (
          <div key={r} className="v1-marquee__row" aria-hidden="true">
            {[...stack, ...stack].map((t, i) => (
              <span key={i}>{t}<svg viewBox="0 0 10 10"><path d="M5 0 L10 5 L5 10 L0 5 Z" /></svg></span>
            ))}
          </div>
        ))}
      </section>

      {/* OWNERSHIP */}
      <section className="v1-work" aria-labelledby="v1-work-title">
        <div className="v1-work__head">
          <div>
            <p className="v1-eyebrow">03 · {pages.ownershipHead.eyebrow}</p>
            <h2 id="v1-work-title">{pages.ownershipHead.title}</h2>
          </div>
          <TLink href="/v1/process" className="v1-link" label="Process">How we work</TLink>
        </div>
        <div className="v1-work__grid v1-work__grid--four">
          {ownership.map((o) => (
            <article key={o.name} className="v1-work__card">
              <div className="v1-work__cover v1-work__cover--file">
                <pre aria-hidden="true">{o.snippet.map((l) => <code key={l} className={l.startsWith("✓") ? "is-ok" : undefined}>{l}</code>)}</pre>
              </div>
              <div className="v1-work__meta">
                <h3>{o.name}</h3>
                <p>{o.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PROOF */}
      <section className="v1-proof" aria-labelledby="v1-proof-title">
        <div className="v1-proof__text">
          <p className="v1-eyebrow">04 · {pages.agileHead.eyebrow}</p>
          <h2 id="v1-proof-title">{agile.title}</h2>
          <p>{agile.body}</p>
          <ul className="v1-proof__points" role="list">
            {agile.points.map((x) => <li key={x.name}><b>{x.name}.</b> {x.body}</li>)}
          </ul>
          <dl className="v1-proof__stats">
            {stats.map((s) => (
              <div key={s.label}>
                <dd><span data-count={s.value}>{s.value}</span>{s.suffix}</dd>
                <dt>{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="v1-log" data-ui>
          <div className="v1-log__bar"><i /><i /><i /><b>sprint-07.log</b></div>
          <pre className="v1-log__pre">
            <code>
              {buildLog.map((l) => (
                <span key={l} className="v1-log__line" data-text={l}>{l}</span>
              ))}
            </code>
          </pre>
        </div>
      </section>
    </div>
  );
}
