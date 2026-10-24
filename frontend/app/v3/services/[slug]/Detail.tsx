"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { magnetic } from "@/components/motion/effects";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { promises, serviceBySlug, services } from "@/lib/copy";

/* One service, loud: the title stretches in, six colour blocks stack up, the next service waits at the end. */
export function Detail({ slug }: { slug: string }) {
  const root = useRef<HTMLDivElement>(null);
  const s = serviceBySlug(slug)!;
  const i = services.indexOf(s);
  const next = services[(i + 1) % services.length];

  useGSAP(
    () => {
      const offMag = magnetic(root.current!, "[data-magnetic]", 0.5);
      if (reducedMotion()) return offMag;
      const t = SplitText.create(".v3-sub__title", { type: "words,chars", charsClass: "k" });
      gsap.set(t.chars, { "--w": 62, yPercent: 100, autoAlpha: 0 });
      gsap.set(".v3-sub__head .v3-card__tag, .v3-card__promise--head, .v3-sub__lede, .v3-sub__actions", { autoAlpha: 0, y: 30 });
      const off = onPageEnter("v3", () =>
        gsap
          .timeline()
          .to(t.chars, { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.02, ease: ease.out })
          .to(t.chars, { "--w": 125, duration: 1, stagger: 0.02, ease: "power3.inOut" }, 0.1)
          .to(".v3-sub__head .v3-card__tag, .v3-card__promise--head, .v3-sub__lede, .v3-sub__actions", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: ease.out }, 0.5),
      );
      gsap.utils.toArray<HTMLElement>(".v3-svc").forEach((b) => {
        gsap.from(b, { yPercent: 18, rotate: gsap.utils.random(-3, 3), autoAlpha: 0, duration: 1, ease: ease.out, scrollTrigger: { trigger: b, start: "top 88%" } });
      });
      gsap.fromTo(".v3-next__name", { "--w": 62 }, { "--w": 125, ease: "none", scrollTrigger: { trigger: ".v3-next", start: "top 95%", end: "top 40%", scrub: true } });
      return () => {
        offMag();
        off();
      };
    },
    { scope: root, dependencies: [slug], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="v3-page v3-sub">
      <header className="v3-sub__head">
        <p className="v3-card__tag">0{i + 1} · {s.tag} · Software Development</p>
        <h1 className="v3-sub__title v3-sub__title--svc">{s.name}</h1>
        <p className="v3-card__promise v3-card__promise--head">{s.promise}</p>
        <p className="v3-sub__lede">{s.lede}</p>
        <div className="v3-sub__actions">
          <TLink href={`/v3/contact?service=${s.slug}`} className="v3-blob" data-magnetic label="Contact">{s.cta}</TLink>
          <TLink href="/v3/services" className="v3-pill" label="Services">All services</TLink>
        </div>
      </header>

      <div className="v3-svcs">
        <h2 className="sr-only">Our {s.tag.toLowerCase()} capabilities</h2>
        {s.groups.map((g, k) => (
          <section key={g.name} className={`v3-svc v3-svc--${k % 3}`} aria-labelledby={`k-g-${k}`}>
            <p className="v3-card__tag">0{k + 1}</p>
            <h2 id={`k-g-${k}`} className="v3-svc__name v3-svc__name--sm">{g.name}</h2>
            <div className="v3-svc__grid v3-svc__grid--two">
              {g.items.map((c) => (
                <div key={c.title} className="v3-svc__body">
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="v3-process" aria-label={`${s.name}, in one line`}>
        <h2 className="v3-closing">{s.closing}</h2>
        <ol className="v3-steps v3-steps--three">
          {promises.map((p) => (
            <li key={p.name}><h3>{p.name}</h3><p>{p.body}</p></li>
          ))}
        </ol>
      </section>

      <section className="v3-next" aria-label="Next service">
        <TLink href={`/v3/services/${next.slug}`} label={next.name} className="v3-next__link" data-cursor="Next">
          <small>Next service · 0{services.indexOf(next) + 1} · {next.tag}</small>
          <b className="v3-next__name">{next.name}</b>
          <span>{next.promise} →</span>
        </TLink>
      </section>
    </div>
  );
}
