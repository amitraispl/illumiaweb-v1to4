"use client";

import { useRef, useState } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { magnetic, directionalFill } from "@/components/motion/effects";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { promises, serviceBySlug, services } from "@/lib/copy";
import { burst, splat, zone } from "../../flux";
import { blip } from "../../sound";

/* One service: its six capability groups as liquid strips, a closing line, and the next service. */
export function Detail({ slug }: { slug: string }) {
  const root = useRef<HTMLDivElement>(null);
  const s = serviceBySlug(slug)!;
  const i = services.indexOf(s);
  const next = services[(i + 1) % services.length];
  const [open, setOpen] = useState(0);

  useGSAP(
    () => {
      const el = root.current!;
      const offs = [magnetic(el, "[data-magnetic]"), directionalFill(el, ".v6-btn")];
      zone(".v6-sub__head", "vortex", 0.6);
      zone(".v6-strips", "calm", 0.5);
      zone(".v6-say", "storm", 0.4);
      if (reducedMotion()) return () => offs.forEach((f) => f());
      const split = SplitText.create(".v6-sub__title", { type: "words,chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 120, skewY: 12 });
      gsap.set(".v6-sub__head .v6-eyebrow, .v6-strip__promise--head, .v6-sub__lede, .v6-sub__actions, .v6-strip", { autoAlpha: 0, y: 40 });
      offs.push(
        onPageEnter("v6", () =>
          gsap.timeline()
            .to(split.chars, { yPercent: 0, skewY: 0, stagger: 0.025, duration: 1.2, ease: ease.out })
            .to(".v6-sub__head .v6-eyebrow, .v6-strip__promise--head, .v6-sub__lede, .v6-sub__actions", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.07, ease: ease.out }, 0.4)
            .to(".v6-strip", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.05, ease: ease.out }, 0.5),
        ),
      );
      const words = SplitText.create(".v6-say p", { type: "words" });
      gsap.fromTo(words.words, { opacity: 0.1, y: 20 }, { opacity: 1, y: 0, stagger: 0.05, ease: "none", scrollTrigger: { trigger: ".v6-say", start: "top 80%", end: "bottom 65%", scrub: true } });
      return () => offs.forEach((f) => f());
    },
    { scope: root, dependencies: [slug], revertOnUpdate: true },
  );

  const pick = (k: number, e?: { clientX: number; clientY: number }) => {
    if (k === open) return;
    setOpen(k);
    blip(k);
    if (e) burst(e.clientX, e.clientY, 8, 22, 0.5);
  };

  return (
    <div ref={root} className="v6-page v6-sub">
      <header className="v6-sub__head">
        <p className="v6-eyebrow">0{i + 1} · {s.tag} · Software Development</p>
        <h1 className="v6-sub__title v6-sub__title--svc">{s.name}</h1>
        <p className="v6-strip__promise v6-strip__promise--head">{s.promise}</p>
        <p className="v6-sub__lede">{s.lede}</p>
        <div className="v6-sub__actions">
          <TLink href={`/v6/contact?service=${s.slug}`} className="v6-btn v6-btn--solid" data-magnetic label="Contact"><span>{s.cta}</span></TLink>
          <TLink href="/v6/services" className="v6-btn" data-magnetic label="Services"><span>All services</span></TLink>
        </div>
      </header>

      <div className="v6-strips v6-strips--six">
        <h2 className="sr-only">Our {s.tag.toLowerCase()} capabilities</h2>
        {s.groups.map((g, k) => (
          <section
            key={g.name}
            className={`v6-strip${k === open ? " is-open" : ""}`}
            aria-labelledby={`v6-g-${k}`}
            onPointerEnter={(e) => pick(k, e)}
            onPointerMove={(e) => k === open && Math.random() < 0.15 && splat(e.clientX, e.clientY, e.movementX, e.movementY, undefined, 0.1)}
          >
            <h3 id={`v6-g-${k}`}>
              <button type="button" onClick={() => pick(k)} onFocus={() => pick(k)} aria-expanded={k === open} aria-controls={`v6-g-body-${k}`}>
                <span className="v6-strip__n">0{k + 1}</span>
                <span className="v6-strip__name">{g.name}</span>
              </button>
            </h3>
            <div className="v6-strip__body" id={`v6-g-body-${k}`} hidden={k !== open}>
              <div className="v6-strip__cols">
                {g.items.map((c) => (
                  <div key={c.title}>
                    <h4>{c.title}</h4>
                    <p>{c.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="v6-say" aria-label={`${s.name}, in one line`}>
        <p>{s.closing}</p>
        <ul role="list" className="v6-chips">{promises.map((p) => <li key={p.name}>{p.name}</li>)}</ul>
      </section>

      <section className="v6-next" aria-label="Next service">
        <TLink href={`/v6/services/${next.slug}`} label={next.name} className="v6-next__link" data-cursor="view">
          <small>Next service · 0{services.indexOf(next) + 1} · {next.tag}</small>
          <b>{next.name}</b>
          <span>{next.promise} →</span>
        </TLink>
      </section>
    </div>
  );
}
