"use client";

import { useRef } from "react";
import { TLink, useTransition } from "@/components/motion/Transition";
import { Clock } from "@/components/motion/Clock";
import { magnetic, directionalFill, countUp } from "@/components/motion/effects";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion, finePointer } from "@/lib/gsap";
import { agile, company, intro, ownership, pages, services, stats } from "@/lib/copy";
import { Liquid, liquid } from "./Liquid";
import { Physics } from "./Physics";
import { Pipeline } from "./Pipeline";
import { Board, type Tile } from "./Board";
import { zone } from "./flux";

/* every capability group of every service, as tiles on the endless board */
const capabilities: Tile[] = services.flatMap((s) =>
  s.groups.map((g, k) => ({
    key: `${s.slug}-${k}`,
    kicker: `${s.tag} · ${String(k + 1).padStart(2, "0")}`,
    title: g.name,
    lines: g.items.map((c) => c.title),
  })),
);

export default function FluxHome() {
  const root = useRef<HTMLDivElement>(null);
  const { navigate } = useTransition();

  useGSAP(
    () => {
      const el = root.current!;
      const offs = [magnetic(el, "[data-magnetic]"), directionalFill(el, ".v6-btn")];
      countUp(el);

      zone(".v6-hero-zone", "calm", 0.7);
      zone(".v6-say", "vortex", 0.7);
      zone(".v6-playground", "calm", 0.25);
      zone(".v6-nums", "vortex", 0.9);
      zone(".v6-pipe-zone", "jets", 0.6);
      zone(".v6-own", "storm", 0.35);
      zone(".v6-agile", "calm", 0.5);
      zone(".v6-boardz", "storm", 0.45);
      zone(".v6-offices", "jets", 0.5);

      if (reducedMotion()) {
        liquid.solid = 1;
        return () => offs.forEach((f) => f());
      }

      /* --- hero: lines pour in, then scrolling turns the liquid into the solid mark --- */
      const split = SplitText.create(".v6-hero__title .ln", { type: "words,chars", charsClass: "ch", mask: "lines" });
      gsap.set(split.chars, { yPercent: 120, skewY: 14 });
      gsap.set(".v6-hero__sub, .v6-hero__actions, .v6-hero__hint, .v6-hero .v6-eyebrow", { autoAlpha: 0, y: 24 });
      offs.push(
        onPageEnter("v6", () => {
          gsap.timeline()
            .to(split.chars, { yPercent: 0, skewY: 0, duration: 1.4, stagger: 0.02, ease: ease.out })
            .to(".v6-hero__sub, .v6-hero__actions, .v6-hero__hint, .v6-hero .v6-eyebrow", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: ease.out }, 0.5);
        }),
      );

      liquid.solid = 0;
      gsap.timeline({
        scrollTrigger: { trigger: ".v6-hero", start: "top top", end: "+=110%", pin: true, scrub: 0.6 },
      })
        .to(liquid, { solid: 1, ease: "power2.inOut", duration: 1 }, 0)
        .to(".v6-hero", { "--solid": 1, ease: "power2.inOut", duration: 1 }, 0)
        .to(".v6-hero__copy", { yPercent: -8, duration: 1, ease: "none" }, 0)
        .to(".v6-hero__hint", { autoAlpha: 0, duration: 0.2 }, 0);

      /* the wobble filter on the liquid line breathes, and the object melts under the pointer */
      const turb = el.querySelector<SVGFETurbulenceElement>("#v6-wobble feTurbulence");
      const disp = el.querySelector<SVGFEDisplacementMapElement>("#v6-wobble feDisplacementMap");
      const w = { f: 0.012, s: 10 };
      gsap.to(w, {
        f: 0.02, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1,
        onUpdate: () => {
          turb?.setAttribute("baseFrequency", `${w.f} ${w.f * 2.2}`);
          disp?.setAttribute("scale", String(w.s * (1 - liquid.solid * 0.85)));
        },
      });
      if (finePointer()) {
        const stage = el.querySelector<HTMLElement>(".v6-hero__liquid")!;
        const melt = () => gsap.to(liquid, { melt: 1, duration: 0.8, ease: "power2.out" });
        const set = () => gsap.to(liquid, { melt: 0, duration: 1.4, ease: "power2.inOut" });
        stage.addEventListener("pointerenter", melt);
        stage.addEventListener("pointerleave", set);
        offs.push(() => { stage.removeEventListener("pointerenter", melt); stage.removeEventListener("pointerleave", set); });
      }

      /* --- the philosophy: words surface one by one out of the ink --- */
      const words = SplitText.create(".v6-say p", { type: "words" });
      gsap.fromTo(words.words, { opacity: 0.1, y: 20 }, {
        opacity: 1, y: 0, stagger: 0.05, ease: "none",
        scrollTrigger: { trigger: ".v6-say", start: "top 80%", end: "bottom 65%", scrub: true },
      });

      gsap.utils.toArray<HTMLElement>(".v6-sec-head").forEach((h) => {
        gsap.from(h.children, { y: 50, autoAlpha: 0, stagger: 0.08, duration: 1.1, ease: ease.out, scrollTrigger: { trigger: h, start: "top 80%" } });
      });
      gsap.utils.toArray<HTMLElement>(".v6-cards").forEach((g) => {
        gsap.from(g.children, { y: 70, rotate: () => gsap.utils.random(-3, 3), autoAlpha: 0, stagger: 0.08, duration: 1.1, ease: ease.out, scrollTrigger: { trigger: g, start: "top 82%" } });
      });

      return () => offs.forEach((f) => f());
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v6-page">
      <svg width="0" height="0" className="v6-defs" aria-hidden="true">
        <filter id="v6-wobble">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.026" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* HERO */}
      <div className="v6-hero-zone">
        <section className="v6-hero" aria-labelledby="v6-title">
          <div className="v6-hero__liquid" data-cursor="view">
            <Liquid className="v6-hero__canvas" />
          </div>
          <div className="v6-hero__copy">
            <p className="v6-eyebrow">{intro.eyebrow} · Illumia Software Development</p>
            <h1 id="v6-title" className="v6-hero__title">
              <span className="ln ln--fluid">{intro.title[0]}</span>
              <span className="ln ln--solid">{intro.title[1]} {intro.title[2]}</span>
            </h1>
            <p className="v6-hero__sub">{intro.lede}</p>
            <div className="v6-hero__actions">
              <TLink href="/v6/contact" className="v6-btn v6-btn--solid" data-magnetic label="Contact"><span>{pages.hero.primary}</span></TLink>
              <TLink href="/v6/services" className="v6-btn" data-magnetic label="Services"><span>{pages.hero.secondary}</span></TLink>
            </div>
          </div>
          <p className="v6-hero__hint" aria-hidden="true">Stir the ink · scroll to set it solid</p>
        </section>
      </div>

      {/* PHILOSOPHY */}
      <section className="v6-say" aria-label="Our philosophy">
        <p>{intro.philosophy}</p>
        <small>{pages.philosophyBy}</small>
      </section>

      {/* SERVICES, THROWABLE */}
      <section className="v6-playground" aria-labelledby="v6-play-title">
        <div className="v6-sec-head">
          <p className="v6-eyebrow">01 · {pages.servicesHead.eyebrow}</p>
          <h2 id="v6-play-title">{pages.servicesHead.title}.</h2>
          <p className="v6-sec-head__lede">{intro.about}</p>
        </div>
        <Physics />
      </section>

      {/* NUMBERS */}
      <section className="v6-nums" aria-label="How we deliver, in numbers">
        <dl>
          {stats.map((s) => (
            <div key={s.label}>
              <dd><span data-count={s.value}>{s.value}</span>{s.suffix}</dd>
              <dt>{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* THE CYCLE */}
      <div className="v6-pipe-zone"><Pipeline index="02" /></div>

      {/* OWNERSHIP */}
      <section className="v6-own" aria-labelledby="v6-own-title">
        <div className="v6-sec-head">
          <p className="v6-eyebrow">03 · {pages.ownershipHead.eyebrow}</p>
          <h2 id="v6-own-title">{pages.ownershipHead.title}.</h2>
        </div>
        <div className="v6-cards">
          {ownership.map((o) => (
            <article key={o.name} className="v6-card">
              <pre aria-hidden="true">{o.snippet.map((l) => <code key={l} className={l.startsWith("✓") ? "is-ok" : undefined}>{l}</code>)}</pre>
              <h3>{o.name}</h3>
              <p>{o.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* AGILE */}
      <section className="v6-agile" aria-labelledby="v6-agile-title">
        <div className="v6-sec-head">
          <p className="v6-eyebrow">04 · {pages.agileHead.eyebrow}</p>
          <h2 id="v6-agile-title">{agile.title}</h2>
          <p className="v6-sec-head__lede">{agile.body}</p>
        </div>
        <div className="v6-cards">
          {agile.points.map((x, i) => (
            <article key={x.name} className="v6-card">
              <span className="v6-card__n">0{i + 1}</span>
              <h3>{x.name}</h3>
              <p>{x.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CAPABILITY BOARD */}
      <section className="v6-boardz" aria-labelledby="v6-board-title">
        <div className="v6-sec-head">
          <p className="v6-eyebrow">05 · Core capabilities</p>
          <h2 id="v6-board-title">{capabilities.length} capabilities across {services.length} disciplines. <em>Drag them.</em></h2>
        </div>
        <Board
          items={capabilities}
          ratio={0.62}
          height="72vh"
          label="Capability board"
          onOpen={(t) => {
            const s = services.find((x) => t.key.startsWith(`${x.slug}-`))!;
            navigate(`/v6/services/${s.slug}`, s.name);
          }}
        />
        <TLink href="/v6/services" className="v6-link" label="Services">All four services</TLink>
      </section>

      {/* OFFICES */}
      <section className="v6-offices v6-reach" aria-labelledby="v6-offices-title">
        <p className="v6-eyebrow">06 · {pages.officesHead.eyebrow}</p>
        <h2 id="v6-offices-title">{pages.officesHead.title}</h2>
        <p className="v6-sec-head__lede">{pages.officesHead.body}</p>
        <ul role="list">
          {company.offices.map((o) => (
            <li key={o.country}><span>{o.city}<small>{o.country}{o.hq ? " · HQ" : ""}</small></span><Clock tz={o.tz} /></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
