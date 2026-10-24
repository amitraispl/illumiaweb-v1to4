"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, ScrollTrigger, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { pages, process, promises, services } from "@/lib/copy";

export default function BeaconServices() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const split = SplitText.create(".v1-sub__title", { type: "chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 110 });
      gsap.set(".v1-sub__lede, .v1-sub__head .v1-eyebrow", { autoAlpha: 0, y: 20 });
      const off = onPageEnter("v1", () =>
        gsap
          .timeline()
          .to(split.chars, { yPercent: 0, stagger: 0.03, duration: 1, ease: ease.out })
          .to(".v1-sub__lede, .v1-sub__head .v1-eyebrow", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: ease.out }, 0.4),
      );

      /* each service row lights up while it crosses the middle of the screen */
      gsap.utils.toArray<HTMLElement>(".v1-svc").forEach((row) => {
        ScrollTrigger.create({
          trigger: row, start: "top 60%", end: "bottom 40%",
          toggleClass: { targets: row, className: "is-lit" },
        });
        gsap.from(row.querySelectorAll(".v1-svc__name, .v1-svc__promise, .v1-svc__body, .v1-svc__cols > *, .v1-svc .v1-btn"), {
          y: 36, autoAlpha: 0, stagger: 0.07, duration: 0.9, ease: ease.out,
          scrollTrigger: { trigger: row, start: "top 80%" },
        });
      });

      /* the scan line follows the reader down the list */
      gsap.to(".v1-svcs__scan", {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: ".v1-svcs", start: "top 50%", end: "bottom 50%", scrub: true },
      });
      return off;
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v1-page v1-sub">
      <header className="v1-sub__head">
        <p className="v1-eyebrow">{pages.servicesHead.eyebrow} · 0{services.length} disciplines</p>
        <h1 className="v1-sub__title">{pages.servicesPage.title}</h1>
        <p className="v1-sub__lede">{pages.servicesPage.lede}</p>
      </header>

      <div className="v1-svcs">
        <span className="v1-svcs__scan" aria-hidden="true" />
        {services.map((s, i) => (
          <section key={s.slug} className="v1-svc" id={s.slug} aria-labelledby={`svc-${s.slug}`}>
            <div className="v1-svc__lead">
              <p className="v1-eyebrow">0{i + 1} · {s.tag}</p>
              <h2 id={`svc-${s.slug}`} className="v1-svc__name">{s.name}</h2>
              <p className="v1-svc__promise">{s.promise}</p>
            </div>
            <p className="v1-svc__body">{s.short}</p>
            <div className="v1-svc__cols">
              <div>
                <h3>Core capabilities</h3>
                <ul role="list">{s.highlights.map((d) => <li key={d}>{d}</li>)}</ul>
              </div>
              <div>
                <h3>Usually built with</h3>
                <ul role="list" className="v1-chips">{s.stack.map((d) => <li key={d}>{d}</li>)}</ul>
              </div>
            </div>
            <TLink href={`/v1/services/${s.slug}`} className="v1-btn" label={s.name}><span>Read more</span></TLink>
          </section>
        ))}
      </div>

      <section className="v1-sub__band" aria-labelledby="v1-engage">
        <h2 id="v1-engage">{pages.servicesPage.promisesTitle}</h2>
        <div className="v1-engage">
          {promises.map((p) => (
            <article key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
        <p className="v1-sub__note">
          All four run on the same {process.length}-stage cycle, from {process[0].name.toLowerCase()} to{" "}
          {process[process.length - 1].name.toLowerCase()}, and back again.{" "}
          <TLink href="/v1/process" className="v1-link" label="Process">See how we work</TLink>
        </p>
      </section>
    </div>
  );
}
