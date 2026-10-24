"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { pages, process, promises, services } from "@/lib/copy";

export default function KineticServices() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v3-sub__title", { type: "words,chars", charsClass: "k" });
      gsap.set(t.chars, { "--w": 62, yPercent: 100, autoAlpha: 0 });
      gsap.set(".v3-svc", { autoAlpha: 0, y: 60 });
      const off = onPageEnter("v3", () =>
        gsap
          .timeline()
          .to(t.chars, { yPercent: 0, autoAlpha: 1, "--w": 125, duration: 1, stagger: 0.03, ease: ease.out })
          .to(".v3-svc", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.07, ease: ease.out }, 0.3),
      );

      /* rows widen as they reach the middle of the screen */
      gsap.utils.toArray<HTMLElement>(".v3-svc__name").forEach((n) => {
        gsap.fromTo(n, { "--w": 70 }, {
          "--w": 125, ease: "none",
          scrollTrigger: { trigger: n, start: "top 95%", end: "top 45%", scrub: true },
        });
      });

      /* process steps fill a bar one segment at a time */
      gsap.from(".v3-steps li", {
        autoAlpha: 0, y: 40, stagger: 0.08, duration: 0.8, ease: ease.out,
        scrollTrigger: { trigger: ".v3-steps", start: "top 80%" },
      });
      return off;
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v3-page v3-sub">
      <header className="v3-sub__head">
        <h1 className="v3-sub__title">{pages.servicesPage.title}</h1>
        <p className="v3-sub__lede">{pages.servicesPage.lede}</p>
      </header>

      <div className="v3-svcs">
        {services.map((s, i) => (
          <section key={s.slug} id={s.slug} className={`v3-svc v3-svc--${i % 3}`} aria-labelledby={`k-${s.slug}`}>
            <p className="v3-card__tag">0{i + 1} · {s.tag}</p>
            <h2 id={`k-${s.slug}`} className="v3-svc__name">{s.name}</h2>
            <div className="v3-svc__grid">
              <div className="v3-svc__body">
                <p className="v3-card__promise">{s.promise}</p>
                <p>{s.short}</p>
                <TLink href={`/v3/services/${s.slug}`} className="v3-pill v3-pill--solid" label={s.name}>Read more</TLink>
              </div>
              <ul role="list" className="v3-svc__list">{s.highlights.map((d) => <li key={d}>{d}</li>)}</ul>
              <ul role="list" className="v3-svc__tags">{s.stack.map((d) => <li key={d}>{d}</li>)}</ul>
            </div>
          </section>
        ))}
      </div>

      <section className="v3-process" aria-labelledby="k-process">
        <h2 id="k-process">{pages.servicesPage.promisesTitle}</h2>
        <ol className="v3-steps v3-steps--three">
          {promises.map((p) => (
            <li key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
        <p className="v3-sub__note">
          All four run on the same {process.length}-stage cycle, from {process[0].name.toLowerCase()} to{" "}
          {process[process.length - 1].name.toLowerCase()}, and back again.
        </p>
        <TLink href="/v3/process" className="v3-blob" label="Process">See how we work</TLink>
      </section>
    </div>
  );
}
