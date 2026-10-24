"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { agile, intro, ownership, pages, process } from "@/lib/copy";

/* The seven stages drawn as a survey line, slowly; then the sprint rules and what you keep. */
export default function BlueprintProcess() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v4-sub__title", { type: "lines", mask: "lines" });
      gsap.set(t.lines, { yPercent: 100 });
      gsap.set(".v4-sub__lede", { autoAlpha: 0, y: 24 });
      const off = onPageEnter("v4", () =>
        gsap
          .timeline()
          .to(t.lines, { yPercent: 0, duration: 1.4, stagger: 0.1, ease: ease.out })
          .to(".v4-sub__lede", { autoAlpha: 1, y: 0, duration: 1.1, ease: ease.out }, 0.5),
      );
      gsap.utils.toArray<HTMLElement>(".v4-stage").forEach((s) => {
        gsap.from(s.querySelector(".v4-stage__rule"), { scaleX: 0, duration: 1.6, ease: ease.wipe, scrollTrigger: { trigger: s, start: "top 85%" } });
        gsap.from(s.querySelectorAll(".v4-stage__n, h2, p"), { y: 30, autoAlpha: 0, stagger: 0.1, duration: 1.2, ease: ease.out, scrollTrigger: { trigger: s, start: "top 80%" } });
      });
      gsap.from(".v4-agile li, .v4-own li", { y: 30, autoAlpha: 0, stagger: 0.08, duration: 1.1, ease: ease.out, scrollTrigger: { trigger: ".v4-agile", start: "top 75%" } });
      return off;
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v4-page v4-sub">
      <header className="v4-sub__head">
        <p className="v4-room__line"><em>{pages.processHead.eyebrow} · {process.length} stages, every sprint</em></p>
        <h1 className="v4-sub__title">A cycle, <em>not</em> a straight line.</h1>
        <p className="v4-sub__lede">{pages.processPage.lede}</p>
      </header>

      <ol className="v4-stages" role="list">
        {process.map((p, k) => (
          <li key={p.name} id={`stage-${k + 1}`} className="v4-stage">
            <i className="v4-stage__rule" aria-hidden="true" />
            <span className="v4-stage__n">{String(k + 1).padStart(2, "0")}</span>
            <h2>{p.name}</h2>
            <p>{p.body}</p>
          </li>
        ))}
        <li className="v4-stage v4-stage--loop" aria-hidden="true"><em>↺ {pages.processPage.loop}</em></li>
      </ol>

      <section className="v4-plan v4-agile" aria-labelledby="v4-agile-title">
        <div className="v4-plan__head">
          <p className="v4-room__line"><em>{pages.agileHead.eyebrow}</em></p>
          <h2 id="v4-agile-title" className="v4-h">{agile.title}</h2>
          <p>{agile.body}</p>
        </div>
        <ol className="v4-own" role="list">
          {agile.points.map((x, i) => <li key={x.name}><small>{String(i + 1).padStart(2, "0")}</small><h3>{x.name}</h3><p>{x.body}</p></li>)}
        </ol>
        <div className="v4-plan__head">
          <p className="v4-room__line"><em>{pages.ownershipHead.eyebrow}</em></p>
          <h2 className="v4-h">{pages.ownershipHead.title}.</h2>
        </div>
        <ol className="v4-own" role="list">
          {ownership.map((o, i) => <li key={o.name}><small>{String(i + 1).padStart(2, "0")}</small><h3>{o.name}</h3><p>{o.body}</p></li>)}
        </ol>
      </section>

      <section className="v4-sub__close">
        <h2><em>{intro.philosophy}</em></h2>
        <p>{pages.philosophyBy}</p>
        <TLink href="/v4/services" className="v4-btn" label="Services">Explore the four services</TLink>
      </section>
    </div>
  );
}
