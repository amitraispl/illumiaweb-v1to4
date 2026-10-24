"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { agile, intro, ownership, pages, process } from "@/lib/copy";
import { Pipeline } from "../Pipeline";
import { zone } from "../flux";

/* The cycle in full: scroll it round once, then the sprint rules and what you keep. */
export default function FluxProcess() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      zone(".v6-sub__head", "vortex", 0.8);
      zone(".v6-pipe-zone", "jets", 0.6);
      zone(".v6-agile", "calm", 0.5);
      zone(".v6-own", "storm", 0.35);
      zone(".v6-say", "rain", 0.6);
      if (reducedMotion()) return;
      const split = SplitText.create(".v6-sub__title", { type: "words,chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 120, skewY: 12 });
      gsap.set(".v6-sub__lede, .v6-sub__head .v6-eyebrow", { autoAlpha: 0, y: 40 });
      const off = onPageEnter("v6", () =>
        gsap.timeline()
          .to(split.chars, { yPercent: 0, skewY: 0, stagger: 0.025, duration: 1.2, ease: ease.out })
          .to(".v6-sub__lede, .v6-sub__head .v6-eyebrow", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: ease.out }, 0.4),
      );
      gsap.utils.toArray<HTMLElement>(".v6-cards").forEach((g) => {
        gsap.from(g.children, { y: 70, rotate: () => gsap.utils.random(-3, 3), autoAlpha: 0, stagger: 0.08, duration: 1.1, ease: ease.out, scrollTrigger: { trigger: g, start: "top 82%" } });
      });
      return off;
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v6-page v6-sub">
      <header className="v6-sub__head">
        <p className="v6-eyebrow">{pages.processHead.eyebrow} · {process.length} stages, every sprint</p>
        <h1 className="v6-sub__title v6-sub__title--svc">{pages.processPage.title}</h1>
        <p className="v6-sub__lede">{pages.processPage.lede}</p>
      </header>

      <div className="v6-pipe-zone"><Pipeline index="01" /></div>

      <section className="v6-agile" aria-labelledby="v6-agile-title">
        <div className="v6-sec-head">
          <p className="v6-eyebrow">02 · {pages.agileHead.eyebrow}</p>
          <h2 id="v6-agile-title">{agile.title}</h2>
          <p className="v6-sec-head__lede">{agile.body}</p>
        </div>
        <div className="v6-cards">
          {agile.points.map((x, i) => (
            <article key={x.name} className="v6-card"><span className="v6-card__n">0{i + 1}</span><h3>{x.name}</h3><p>{x.body}</p></article>
          ))}
        </div>
      </section>

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

      <section className="v6-say" aria-label="Our philosophy">
        <p>{intro.philosophy}</p>
        <small>{pages.philosophyBy}</small>
        <TLink href="/v6/services" className="v6-link" label="Services">Explore the four services</TLink>
      </section>
    </div>
  );
}
