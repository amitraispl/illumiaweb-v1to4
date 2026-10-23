"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { services, process } from "@/lib/content";

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
        <h1 className="v3-sub__title">Services</h1>
        <p className="v3-sub__lede">Six ways in. Every one ends the same way: software in production that your team can run.</p>
      </header>

      <div className="v3-svcs">
        {services.map((s, i) => (
          <section key={s.slug} id={s.slug} className={`v3-svc v3-svc--${i % 3}`} aria-labelledby={`k-${s.slug}`}>
            <h2 id={`k-${s.slug}`} className="v3-svc__name">{s.name}</h2>
            <div className="v3-svc__grid">
              <p className="v3-svc__body">{s.body}</p>
              <ul role="list" className="v3-svc__list">{s.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>
              <ul role="list" className="v3-svc__tags">{s.stack.map((d) => <li key={d}>{d}</li>)}</ul>
            </div>
          </section>
        ))}
      </div>

      <section className="v3-process" aria-labelledby="k-process">
        <h2 id="k-process">From hello to live</h2>
        <ol className="v3-steps">
          {process.map((p) => (
            <li key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.body}</p>
              <span>{p.weeks}</span>
            </li>
          ))}
        </ol>
        <TLink href="/v3/contact" className="v3-blob" label="Contact">Start with discovery</TLink>
      </section>
    </div>
  );
}
