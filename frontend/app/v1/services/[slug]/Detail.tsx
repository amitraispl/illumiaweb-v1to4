"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { magnetic, directionalFill } from "@/components/motion/effects";
import { gsap, ScrollTrigger, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { promises, serviceBySlug, services } from "@/lib/copy";

/* One service in full: its promise, six capability groups lit as you read, and the way on. */
export function Detail({ slug }: { slug: string }) {
  const root = useRef<HTMLDivElement>(null);
  const s = serviceBySlug(slug)!;
  const i = services.indexOf(s);
  const next = services[(i + 1) % services.length];

  useGSAP(
    () => {
      const el = root.current!;
      const offs = [magnetic(el, "[data-magnetic]"), directionalFill(el, ".v1-btn")];
      if (reducedMotion()) return () => offs.forEach((f) => f());
      const split = SplitText.create(".v1-sub__title", { type: "words,chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 110 });
      gsap.set(".v1-sub__head .v1-eyebrow, .v1-svc__promise--head, .v1-sub__lede, .v1-sub__actions", { autoAlpha: 0, y: 20 });
      offs.push(
        onPageEnter("v1", () =>
          gsap
            .timeline()
            .to(split.chars, { yPercent: 0, stagger: 0.02, duration: 1, ease: ease.out })
            .to(".v1-sub__head .v1-eyebrow, .v1-svc__promise--head", { duration: 0.8, autoAlpha: 1, y: 0, stagger: 0.06 }, 0.3)
            .to(".v1-svc__promise--head", { duration: 0.9, scrambleText: { text: "{original}", chars: "01<>/{}#", speed: 0.6 } }, 0.4)
            .to(".v1-sub__lede, .v1-sub__actions", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: ease.out }, 0.5),
        ),
      );
      gsap.utils.toArray<HTMLElement>(".v1-svc").forEach((row) => {
        ScrollTrigger.create({ trigger: row, start: "top 60%", end: "bottom 40%", toggleClass: { targets: row, className: "is-lit" } });
        gsap.from(row.children, { y: 36, autoAlpha: 0, stagger: 0.07, duration: 0.9, ease: ease.out, scrollTrigger: { trigger: row, start: "top 80%" } });
      });
      gsap.to(".v1-svcs__scan", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".v1-svcs", start: "top 50%", end: "bottom 50%", scrub: true } });
      const words = SplitText.create(".v1-statement p", { type: "words" });
      gsap.fromTo(words.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: ".v1-statement", start: "top 75%", end: "bottom 55%", scrub: true } });
      return () => offs.forEach((f) => f());
    },
    { scope: root, dependencies: [slug], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="v1-page v1-sub">
      <header className="v1-sub__head">
        <p className="v1-eyebrow">0{i + 1} · {s.tag} · Software Development</p>
        <h1 className="v1-sub__title v1-sub__title--svc">{s.name}</h1>
        <p className="v1-svc__promise v1-svc__promise--head">{s.promise}</p>
        <p className="v1-sub__lede">{s.lede}</p>
        <div className="v1-sub__actions">
          <TLink href={`/v1/contact?service=${s.slug}`} className="v1-btn v1-btn--solid" data-magnetic label="Contact"><span>{s.cta}</span></TLink>
          <TLink href="/v1/services" className="v1-btn" data-magnetic label="Services"><span>All services</span></TLink>
        </div>
      </header>

      <div className="v1-svcs">
        <span className="v1-svcs__scan" aria-hidden="true" />
        <h2 className="sr-only">Our {s.tag.toLowerCase()} capabilities</h2>
        {s.groups.map((g, k) => (
          <section key={g.name} className="v1-svc" aria-labelledby={`v1-g-${k}`}>
            <div className="v1-svc__lead">
              <p className="v1-eyebrow">0{k + 1}.</p>
              <h2 id={`v1-g-${k}`} className="v1-svc__name v1-svc__name--sm">{g.name}</h2>
            </div>
            <div className="v1-svc__cols">
              {g.items.map((c) => (
                <div key={c.title}>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="v1-statement" aria-label={`${s.name}, in one line`}>
        <p>{s.closing}</p>
        <ul className="v1-chips v1-statement__chips" role="list">{promises.map((p) => <li key={p.name}>{p.name}</li>)}</ul>
      </section>

      <section className="v1-next" aria-label="Next service">
        <TLink href={`/v1/services/${next.slug}`} label={next.name} className="v1-next__link" data-cursor="view">
          <small>Next service · 0{services.indexOf(next) + 1} · {next.tag}</small>
          <b>{next.name}</b>
          <span>{next.promise} →</span>
        </TLink>
      </section>
    </div>
  );
}
