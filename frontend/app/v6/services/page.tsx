"use client";

import { useEffect, useRef, useState } from "react";
import { TLink } from "@/components/motion/Transition";
import { useLenis } from "@/components/motion/SmoothScroll";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { pages, process, promises, services } from "@/lib/copy";
import { burst, splat, zone } from "../flux";
import { blip } from "../sound";

/* Four strips of the same liquid. Point at one and it widens; the ink pours toward it. */
export default function FluxServices() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useGSAP(
    () => {
      const el = root.current!;
      zone(".v6-sub__head", "vortex", 0.7);
      zone(".v6-strips", "calm", 0.5);
      zone(".v6-engage", "jets", 0.6);

      const go = () => {
        const id = decodeURIComponent(location.hash.slice(1));
        const i = services.findIndex((s) => s.slug === id);
        if (i < 0) return;
        setOpen(i);
        const target = el.querySelector<HTMLElement>(".v6-strips");
        if (target && lenisRef.current) lenisRef.current.scrollTo(target, { offset: -90, duration: 1.4 });
        else target?.scrollIntoView();
      };
      if (reducedMotion()) {
        go();
        return;
      }
      const split = SplitText.create(".v6-sub__title", { type: "chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 120, skewY: 12 });
      gsap.set(".v6-sub__lede, .v6-sub__head .v6-eyebrow, .v6-strip", { autoAlpha: 0, y: 40 });
      const off = onPageEnter("v6", () =>
        gsap.timeline({ onComplete: go })
          .to(split.chars, { yPercent: 0, skewY: 0, stagger: 0.04, duration: 1.2, ease: ease.out })
          .to(".v6-sub__lede, .v6-sub__head .v6-eyebrow", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: ease.out }, 0.4)
          .to(".v6-strip", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06, ease: ease.out }, 0.5),
      );
      gsap.from(".v6-engage__card", { y: 80, autoAlpha: 0, rotate: () => gsap.utils.random(-4, 4), stagger: 0.1, duration: 1.1, ease: ease.out, scrollTrigger: { trigger: ".v6-engage", start: "top 75%" } });
      return off;
    },
    { scope: root },
  );

  const pick = (i: number, e?: { clientX: number; clientY: number }) => {
    if (i === open) return;
    setOpen(i);
    blip(i);
    if (e) burst(e.clientX, e.clientY, 8, 22, 0.5);
  };

  return (
    <div ref={root} className="v6-page v6-sub">
      <header className="v6-sub__head">
        <p className="v6-eyebrow">{pages.servicesHead.eyebrow} · 0{services.length} disciplines</p>
        <h1 className="v6-sub__title">{pages.servicesPage.title}</h1>
        <p className="v6-sub__lede">{pages.servicesPage.lede} Point at one to pour it open.</p>
      </header>

      <div className="v6-strips">
        {services.map((s, i) => (
          <section
            key={s.slug}
            id={s.slug}
            className={`v6-strip${i === open ? " is-open" : ""}`}
            aria-labelledby={`v6-svc-${s.slug}`}
            onPointerEnter={(e) => pick(i, e)}
            onPointerMove={(e) => i === open && Math.random() < 0.15 && splat(e.clientX, e.clientY, e.movementX, e.movementY, undefined, 0.1)}
          >
            <h2 id={`v6-svc-${s.slug}`}>
              <button type="button" onClick={() => pick(i)} onFocus={() => pick(i)} aria-expanded={i === open} aria-controls={`v6-svc-body-${s.slug}`}>
                <span className="v6-strip__n">0{i + 1} · {s.tag}</span>
                <span className="v6-strip__name">{s.name}</span>
              </button>
            </h2>
            <div className="v6-strip__body" id={`v6-svc-body-${s.slug}`} hidden={i !== open}>
              <p className="v6-strip__promise">{s.promise}</p>
              <p className="v6-strip__lede">{s.short}</p>
              <div className="v6-strip__cols">
                <div>
                  <h3>Core capabilities</h3>
                  <ul role="list">{s.highlights.map((d) => <li key={d}>{d}</li>)}</ul>
                </div>
                <div>
                  <h3>Usually built with</h3>
                  <ul role="list" className="v6-chips">{s.stack.map((d) => <li key={d}>{d}</li>)}</ul>
                </div>
              </div>
              <TLink href={`/v6/services/${s.slug}`} className="v6-btn v6-btn--solid" label={s.name}><span>Read more</span></TLink>
            </div>
          </section>
        ))}
      </div>

      <section className="v6-engage" aria-labelledby="v6-engage-title">
        <h2 id="v6-engage-title">{pages.servicesPage.promisesTitle}</h2>
        <div className="v6-engage__grid">
          {promises.map((e, i) => (
            <article key={e.name} className="v6-engage__card" onPointerEnter={(ev) => { blip(i + 2); burst(ev.clientX, ev.clientY, 6, 18, 0.5); }}>
              <span>0{i + 1}</span>
              <h3>{e.name}</h3>
              <p>{e.body}</p>
            </article>
          ))}
        </div>
        <p className="v6-sub__note">
          All four run on the same {process.length}-stage cycle, from {process[0].name.toLowerCase()} to{" "}
          {process[process.length - 1].name.toLowerCase()}, and back again.{" "}
          <TLink href="/v6/process" className="v6-link" label="Process">See how we work</TLink>
        </p>
      </section>
    </div>
  );
}
