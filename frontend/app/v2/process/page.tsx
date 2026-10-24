"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { agile, intro, ownership, pages, process } from "@/lib/copy";

/* The process as stacked sheets of the brief, then the sprint rules and what you keep. */
export default function EditorialProcess() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v2-sub__title", { type: "words,chars", mask: "chars", charsClass: "ch" });
      gsap.set(t.chars, { yPercent: 105 });
      gsap.set(".v2-sub__lede", { autoAlpha: 0, y: 24 });
      const off = onPageEnter("v2", () =>
        gsap
          .timeline()
          .to(t.chars, { yPercent: 0, stagger: 0.03, duration: 1.1, ease: ease.out })
          .to(".v2-sub__lede", { autoAlpha: 1, y: 0, duration: 0.9, ease: ease.out }, 0.35),
      );
      gsap.utils.toArray<HTMLElement>(".v2-sheet").forEach((sheet, i, all) => {
        if (i === all.length - 1) return;
        gsap.to(sheet, { scale: 0.94, ease: "none", scrollTrigger: { trigger: all[i + 1], start: "top bottom", end: "top 15%", scrub: true } });
      });
      gsap.from(".v2-agile__list li, .v2-own li", {
        y: 30, autoAlpha: 0, stagger: 0.06, duration: 0.9, ease: ease.out,
        scrollTrigger: { trigger: ".v2-agile", start: "top 75%" },
      });
      const words = SplitText.create(".v2-ink", { type: "words" });
      gsap.fromTo(words.words, { opacity: 0.35 }, {
        opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: ".v2-ink", start: "top 80%", end: "bottom 50%", scrub: true },
      });
      return off;
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v2-page v2-sub">
      <header className="v2-sub__head">
        <h1 className="v2-sub__title">A cycle, <em>not a straight line.</em></h1>
        <p className="v2-sub__lede">{pages.processPage.lede}</p>
      </header>

      <section className="v2-process" aria-label="The seven stages">
        <div className="v2-sheets">
          {process.map((p, i) => (
            <article key={p.name} className="v2-sheet" id={`stage-${i + 1}`}>
              <h2>{p.name}</h2>
              <p>{p.body}</p>
              <span>{i === process.length - 1 ? `↺ ${pages.processPage.loop}` : `Stage ${i + 1} of ${process.length}`}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="v2-agile" aria-labelledby="v2-agile-title">
        <div className="v2-services__head">
          <h2 id="v2-agile-title">{agile.title}</h2>
        </div>
        <p className="v2-agile__lede">{agile.body}</p>
        <ol className="v2-agile__list" role="list">
          {agile.points.map((x, i) => (
            <li key={x.name}><small>0{i + 1}</small><h3>{x.name}</h3><p>{x.body}</p></li>
          ))}
        </ol>
        <div className="v2-services__head">
          <h2>{pages.ownershipHead.title}.</h2>
        </div>
        <ol className="v2-own" role="list">
          {ownership.map((o, i) => (
            <li key={o.name}><small>0{i + 1}</small><h3>{o.name}</h3><p>{o.body}</p></li>
          ))}
        </ol>
      </section>

      <section className="v2-intro" aria-label="Our philosophy">
        <p className="v2-ink">{intro.philosophy}</p>
        <div className="v2-intro__side">
          <p className="v2-intro__by">{pages.philosophyBy}</p>
          <p><TLink href="/v2/services" className="v2-ul" label="Services">Explore the four services</TLink></p>
        </div>
      </section>
    </div>
  );
}
