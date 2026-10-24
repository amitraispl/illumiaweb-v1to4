"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { agile, intro, ownership, pages, process } from "@/lib/copy";

/* The seven stages as a path the light draws down, then what repeats and what you keep. */
export default function BeaconProcess() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const split = SplitText.create(".v1-sub__title", { type: "words,chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 110 });
      gsap.set(".v1-sub__lede, .v1-sub__head .v1-eyebrow", { autoAlpha: 0, y: 20 });
      const off = onPageEnter("v1", () =>
        gsap
          .timeline()
          .to(split.chars, { yPercent: 0, stagger: 0.02, duration: 1, ease: ease.out })
          .to(".v1-sub__lede, .v1-sub__head .v1-eyebrow", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: ease.out }, 0.4),
      );
      gsap.fromTo(".v1-process__path", { drawSVG: "0%" }, {
        drawSVG: "100%", ease: "none",
        scrollTrigger: { trigger: ".v1-process__list", start: "top 70%", end: "bottom 60%", scrub: true },
      });
      gsap.utils.toArray<HTMLElement>(".v1-step").forEach((s) => {
        gsap.from(s.children, { y: 28, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: ease.out, scrollTrigger: { trigger: s, start: "top 82%" } });
      });
      gsap.from(".v1-engage article, .v1-own li", {
        y: 40, autoAlpha: 0, stagger: 0.07, duration: 0.9, ease: ease.out,
        scrollTrigger: { trigger: ".v1-sub__band", start: "top 75%" },
      });
      const words = SplitText.create(".v1-statement p", { type: "words" });
      gsap.fromTo(words.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: ".v1-statement", start: "top 75%", end: "bottom 55%", scrub: true } });
      return off;
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v1-page v1-sub">
      <header className="v1-sub__head">
        <p className="v1-eyebrow">{pages.processHead.eyebrow} · {process.length} stages, every sprint</p>
        <h1 className="v1-sub__title v1-sub__title--svc">{pages.processPage.title}</h1>
        <p className="v1-sub__lede">{pages.processPage.lede}</p>
      </header>

      <section className="v1-process v1-process--page" aria-label="The seven stages">
        <div className="v1-process__list">
          <svg className="v1-process__line" viewBox="0 0 10 600" preserveAspectRatio="none" aria-hidden="true">
            <path className="v1-process__path" d="M5 0 V600" />
          </svg>
          <ol>
            {process.map((p, i) => (
              <li key={p.name} className="v1-step" id={`stage-${i + 1}`}>
                <div className="v1-step__head">
                  <h2>{p.name}</h2>
                  <span>0{i + 1}</span>
                </div>
                <p>{p.body}</p>
              </li>
            ))}
            <li className="v1-step v1-step--loop" aria-hidden="true"><span>↺ {pages.processPage.loop}</span></li>
          </ol>
        </div>
      </section>

      <section className="v1-sub__band" aria-labelledby="v1-agile">
        <p className="v1-eyebrow">{pages.agileHead.eyebrow}</p>
        <h2 id="v1-agile">{agile.title}</h2>
        <p className="v1-sub__note">{agile.body}</p>
        <div className="v1-engage v1-engage--four">
          {agile.points.map((x) => (
            <article key={x.name}>
              <h3>{x.name}</h3>
              <p>{x.body}</p>
            </article>
          ))}
        </div>
        <p className="v1-eyebrow">{pages.ownershipHead.eyebrow}</p>
        <h2>{pages.ownershipHead.title}.</h2>
        <ol className="v1-own" role="list">
          {ownership.map((o, i) => (
            <li key={o.name}>
              <small>0{i + 1}</small>
              <div>
                <h3>{o.name}</h3>
                <p>{o.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="v1-statement" aria-label="Our philosophy">
        <p>{intro.philosophy}</p>
        <small className="v1-statement__by">{pages.philosophyBy}</small>
        <TLink href="/v1/services" className="v1-link" label="Services">Explore the four services</TLink>
      </section>
    </div>
  );
}
