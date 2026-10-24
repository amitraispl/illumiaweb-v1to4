"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { promises, serviceBySlug, services } from "@/lib/copy";

/* A service as a magazine chapter: standfirst, six numbered sections, a pull quote, the next chapter. */
export function Detail({ slug }: { slug: string }) {
  const root = useRef<HTMLDivElement>(null);
  const s = serviceBySlug(slug)!;
  const i = services.indexOf(s);
  const next = services[(i + 1) % services.length];

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v2-sub__title", { type: "words,chars", mask: "chars", charsClass: "ch" });
      gsap.set(t.chars, { yPercent: 105 });
      gsap.set(".v2-chap__kicker, .v2-chap__promise, .v2-sub__lede, .v2-chap__actions", { autoAlpha: 0, y: 24 });
      const off = onPageEnter("v2", () =>
        gsap
          .timeline()
          .to(t.chars, { yPercent: 0, stagger: 0.025, duration: 1.1, ease: ease.out })
          .to(".v2-chap__kicker, .v2-chap__promise, .v2-sub__lede, .v2-chap__actions", { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.9, ease: ease.out }, 0.35),
      );
      gsap.utils.toArray<HTMLElement>(".v2-chap__sec").forEach((sec) => {
        gsap.from(sec, { "--line": 0, duration: 1.2, ease: ease.wipe, scrollTrigger: { trigger: sec, start: "top 85%" } });
        gsap.from(sec.querySelectorAll(".v2-chap__n, h2, .v2-chap__cap"), {
          y: 30, autoAlpha: 0, stagger: 0.08, duration: 1, ease: ease.out, scrollTrigger: { trigger: sec, start: "top 80%" },
        });
      });
      const words = SplitText.create(".v2-ink", { type: "words" });
      gsap.fromTo(words.words, { opacity: 0.35 }, {
        opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: ".v2-ink", start: "top 80%", end: "bottom 50%", scrub: true },
      });
      return off;
    },
    { scope: root, dependencies: [slug], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="v2-page v2-sub">
      <header className="v2-sub__head v2-chap__head">
        <p className="v2-chap__kicker">Chapter {i + 1} of {services.length} · {s.tag}</p>
        <h1 className="v2-sub__title v2-chap__title">{s.name}</h1>
        <p className="v2-chap__promise"><em>{s.promise}</em></p>
        <p className="v2-sub__lede">{s.lede}</p>
        <div className="v2-chap__actions">
          <TLink href={`/v2/contact?service=${s.slug}`} className="v2-btn" label="Contact">{s.cta}</TLink>
          <TLink href="/v2/services" className="v2-ul" label="Services">All services</TLink>
        </div>
      </header>

      <div className="v2-chap">
        <h2 className="sr-only">Our {s.tag.toLowerCase()} capabilities</h2>
        {s.groups.map((g, k) => (
          <section key={g.name} className="v2-chap__sec" aria-labelledby={`v2-g-${k}`}>
            <p className="v2-chap__n">{String(k + 1).padStart(2, "0")}</p>
            <h2 id={`v2-g-${k}`}>{g.name}</h2>
            {g.items.map((c) => (
              <div key={c.title} className="v2-chap__cap">
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </section>
        ))}
      </div>

      <section className="v2-intro" aria-label={`${s.name}, in one line`}>
        <p className="v2-ink">{s.closing}</p>
        <div className="v2-intro__side">
          <ul role="list" className="v2-chap__promises">{promises.map((p) => <li key={p.name}><em>{p.name}.</em> {p.body}</li>)}</ul>
        </div>
      </section>

      <section className="v2-chap__next" aria-label="Next chapter">
        <TLink href={`/v2/services/${next.slug}`} label={next.name} data-cursor="Read">
          <small>Next chapter · {next.tag}</small>
          <b>{next.name}</b>
          <em>{next.promise}</em>
        </TLink>
      </section>
    </div>
  );
}
