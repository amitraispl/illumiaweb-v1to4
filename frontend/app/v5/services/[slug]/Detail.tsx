"use client";

import { useRef, useState } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { magnetic, directionalFill } from "@/components/motion/effects";
import { gsap, ScrollTrigger, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { LOOK, promises, services } from "../../content";
import { morph, state, zone, type Pose } from "../../field";

/* the shape drifts a little from group to group, so each one feels like a new frame of the same build */
const DRIFT: Pose[] = [
  { x: 0.5, y: 0.05, scale: 0.85 },
  { x: 0.46, y: -0.04, scale: 0.92 },
  { x: 0.52, y: 0.02, scale: 0.8 },
  { x: 0.46, y: 0.06, scale: 0.9 },
  { x: 0.5, y: -0.05, scale: 0.86 },
  { x: 0.48, y: 0, scale: 0.94 },
];

/** One service, as a page: the promise, six capability groups, the closing line and the next service. */
export function Detail({ slug }: { slug: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(0);
  const i = services.findIndex((s) => s.slug === slug);
  const s = services[i];
  const next = services[(i + 1) % services.length];
  const shape = LOOK[s.slug];

  useGSAP(
    () => {
      const el = root.current!;
      const offs = [magnetic(el, "[data-magnetic]"), directionalFill(el, ".v5-btn")];
      const wide = () => window.innerWidth >= 900;
      zone(".v5-sub__head", shape, { x: 0.48, scale: 0.95 }, { y: 0.36, scale: 0.75, dim: 0.5 });
      s.groups.forEach((g, k) => {
        ScrollTrigger.create({
          trigger: `#g${k + 1}`, start: "top 55%", end: "bottom 45%", refreshPriority: -1,
          onToggle: (st) => {
            if (!st.isActive) return;
            setNow(k);
            morph(shape, wide() ? DRIFT[k % DRIFT.length] : { y: 0.3, scale: 0.6, dim: 0.3 });
          },
        });
      });
      zone(".v5-closing", "nebula", { scale: 1.2, dim: 0.5 });
      zone(".v5-next", LOOK[next.slug], { x: 0.45, scale: 0.8, dim: 0.85 }, { y: 0.35, scale: 0.6, dim: 0.45 });

      if (reducedMotion()) return () => offs.forEach((f) => f());

      const split = SplitText.create(".v5-sub__title", { type: "words,chars", charsClass: "ch" });
      gsap.set(split.chars, { yPercent: 90, rotateX: -95, autoAlpha: 0, transformOrigin: "50% 100% -40px" });
      gsap.set(".v5-sub__head .v5-eyebrow, .v5-sub__promise, .v5-sub__lede, .v5-sub__actions", { autoAlpha: 0, y: 24 });
      offs.push(
        onPageEnter("v5", () => {
          gsap.timeline()
            .to(split.chars, { yPercent: 0, rotateX: 0, autoAlpha: 1, stagger: 0.025, duration: 1.2, ease: ease.out })
            .to(".v5-sub__head .v5-eyebrow, .v5-sub__promise, .v5-sub__lede, .v5-sub__actions", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: ease.out }, 0.4);
        }),
      );

      gsap.utils.toArray<HTMLElement>(".v5-svc").forEach((row) => {
        gsap.from(row.querySelectorAll(".v5-svc__n, h2, .v5-cap"), {
          y: 50, autoAlpha: 0, stagger: 0.08, duration: 1, ease: ease.out,
          scrollTrigger: { trigger: row, start: "top 80%" },
        });
        gsap.fromTo(row.querySelector(".v5-svc__bar i"), { scaleY: 0 }, {
          scaleY: 1, ease: "none",
          scrollTrigger: { trigger: row, start: "top 60%", end: "bottom 40%", scrub: true },
        });
      });

      /* the closing line comes into focus word by word, like the manifesto on the home page */
      const words = SplitText.create(".v5-closing p", { type: "words" });
      gsap.fromTo(words.words, { opacity: 0.08, filter: "blur(8px)", y: 12 }, {
        opacity: 1, filter: "blur(0px)", y: 0, stagger: 0.06, ease: "none",
        scrollTrigger: { trigger: ".v5-closing", start: "top 80%", end: "bottom 60%", scrub: true },
      });
      gsap.from(".v5-closing__promises li", {
        y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: ease.out,
        scrollTrigger: { trigger: ".v5-closing__promises", start: "top 85%" },
      });

      return () => offs.forEach((f) => f());
    },
    { scope: root, dependencies: [slug] },
  );

  /* the next service's shape leans in while you point at it */
  const peek = (on: boolean) => {
    if (window.innerWidth < 900 || state.held) return;
    morph(LOOK[next.slug], { x: 0.45, scale: on ? 0.98 : 0.8, dim: on ? 1 : 0.85 }, 1.2);
  };

  return (
    <div ref={root} className="v5-page v5-sub">
      <header className="v5-sub__head v5-sub__head--svc">
        <p className="v5-eyebrow">0{i + 1} · {s.tag} · Software Development</p>
        <h1 className="v5-sub__title v5-sub__title--svc">{s.name}</h1>
        <p className="v5-sub__promise">{s.promise}</p>
        <p className="v5-sub__lede">{s.lede}</p>
        <div className="v5-sub__actions">
          <TLink href={`/v5/contact?service=${s.slug}`} className="v5-btn v5-btn--solid" data-magnetic label="Contact"><span>{s.cta}</span></TLink>
          <TLink href="/v5/services" className="v5-btn" data-magnetic label="Services"><span>All services</span></TLink>
        </div>
      </header>

      <div className="v5-svcs">
        <aside className="v5-svcs__now" aria-hidden="true">
          <span className="v5-svcs__big" key={now}>0{now + 1}</span>
          <b>{s.groups[now].name}</b>
          <small>{shape} · 0{now + 1} / 0{s.groups.length}</small>
        </aside>
        <div className="v5-svcs__list">
          <h2 className="sr-only">Our {s.tag.toLowerCase()} capabilities</h2>
          {s.groups.map((g, k) => (
            <section key={g.name} id={`g${k + 1}`} className="v5-svc" aria-labelledby={`v5-g-${k}`}>
              <span className="v5-svc__bar" aria-hidden="true"><i /></span>
              <p className="v5-svc__n">0{k + 1}.</p>
              <h2 id={`v5-g-${k}`}>{g.name}</h2>
              <div className="v5-svc__cols">
                {g.items.map((c) => (
                  <div key={c.title} className="v5-cap">
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <section className="v5-manifesto v5-closing" aria-label={`${s.name}, in one line`}>
        <blockquote>
          <p>{s.closing}</p>
        </blockquote>
        <ul className="v5-closing__promises" role="list">
          {promises.map((p) => <li key={p.name}>{p.name}</li>)}
        </ul>
      </section>

      <section className="v5-next" aria-label="Next service">
        <TLink
          href={`/v5/services/${next.slug}`}
          label={next.name}
          className="v5-next__link"
          data-cursor="view"
          onPointerEnter={() => peek(true)}
          onPointerLeave={() => peek(false)}
        >
          <small>Next service · 0{services.indexOf(next) + 1} · {next.tag}</small>
          <b>{next.name}</b>
          <span>{next.promise} <i aria-hidden="true">→</i></span>
        </TLink>
      </section>
    </div>
  );
}
