"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { agile, intro, ownership, pages, process } from "@/lib/copy";

/* Seven fields of colour, one per stage; each word widens as it reaches the middle of the screen. */
export default function KineticProcess() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v3-sub__title", { type: "words,chars", charsClass: "k" });
      gsap.set(t.chars, { "--w": 62, yPercent: 100, autoAlpha: 0 });
      gsap.set(".v3-sub__lede", { autoAlpha: 0, y: 30 });
      const off = onPageEnter("v3", () =>
        gsap
          .timeline()
          .to(t.chars, { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.02, ease: ease.out })
          .to(t.chars, { "--w": 125, duration: 1, stagger: 0.02, ease: "power3.inOut" }, 0.1)
          .to(".v3-sub__lede", { autoAlpha: 1, y: 0, duration: 0.8, ease: ease.out }, 0.5),
      );
      gsap.utils.toArray<HTMLElement>(".v3-svc__name").forEach((n) => {
        gsap.fromTo(n, { "--w": 70 }, { "--w": 125, ease: "none", scrollTrigger: { trigger: n, start: "top 95%", end: "top 45%", scrub: true } });
      });
      gsap.from(".v3-steps li, .v3-agile__card", {
        autoAlpha: 0, y: 40, stagger: 0.06, duration: 0.8, ease: ease.out,
        scrollTrigger: { trigger: ".v3-agile", start: "top 80%" },
      });
      return off;
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v3-page v3-sub">
      <header className="v3-sub__head">
        <p className="v3-card__tag">{pages.processHead.eyebrow} · {process.length} stages, every sprint</p>
        <h1 className="v3-sub__title v3-sub__title--svc">{pages.processPage.title}</h1>
        <p className="v3-sub__lede">{pages.processPage.lede}</p>
      </header>

      <ol className="v3-svcs" role="list">
        {process.map((p, k) => (
          <li key={p.name} id={`stage-${k + 1}`} className={`v3-svc v3-svc--${k % 3}`}>
            <p className="v3-card__tag">0{k + 1}{k === process.length - 1 ? ` · ↺ ${pages.processPage.loop}` : ""}</p>
            <h2 className="v3-svc__name">{p.name}</h2>
            <p className="v3-svc__body">{p.body}</p>
          </li>
        ))}
      </ol>

      <section className="v3-agile" aria-labelledby="v3-agile-title">
        <div className="v3-head"><h2 id="v3-agile-title">{agile.title}</h2></div>
        <p className="v3-agile__lede">{agile.body}</p>
        <div className="v3-agile__grid">
          {agile.points.map((x, i) => (
            <article key={x.name} className={`v3-agile__card v3-card--${i % 3}`}><h3>{x.name}</h3><p>{x.body}</p></article>
          ))}
        </div>
      </section>

      <section className="v3-process" aria-labelledby="v3-own-title">
        <h2 id="v3-own-title">{pages.ownershipHead.title}.</h2>
        <ol className="v3-steps">
          {ownership.map((o) => (
            <li key={o.name}><h3>{o.name}</h3><p>{o.body}</p></li>
          ))}
        </ol>
      </section>

      <section className="v3-cta" aria-labelledby="v3-cta-title">
        <h2 id="v3-cta-title" className="v3-closing">{intro.philosophy}</h2>
        <TLink href="/v3/services" className="v3-blob v3-blob--big" label="Services">Explore the four services</TLink>
      </section>
    </div>
  );
}
