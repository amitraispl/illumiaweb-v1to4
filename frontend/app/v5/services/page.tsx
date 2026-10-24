"use client";

import { useEffect, useRef, useState } from "react";
import { TLink } from "@/components/motion/Transition";
import { useLenis } from "@/components/motion/SmoothScroll";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, ScrollTrigger, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { LOOK, process, promises, services } from "../content";
import { morph, zone, type Pose } from "../field";
import { tilt } from "../tilt";

/* where each service's shape sits beside its row */
const POSE: Record<string, Pose> = {
  design: { x: 0.5, scale: 0.85 },
  mobile: { x: 0.5, scale: 0.9 },
  web: { x: 0.48, scale: 0.85, dim: 0.9 },
  integrations: { x: 0.48, scale: 0.8 },
};

export default function LumenServices() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);
  const [now, setNow] = useState(0);

  useGSAP(
    () => {
      const el = root.current!;
      zone(".v5-sub__head", "code", { x: 0.45, scale: 0.85 }, { y: 0.35, scale: 0.7, dim: 0.5 });
      services.forEach((s, i) => {
        ScrollTrigger.create({
          trigger: `#${s.slug}`, start: "top 55%", end: "bottom 45%", refreshPriority: -1,
          onToggle: (st) => {
            if (!st.isActive) return;
            setNow(i);
            morph(LOOK[s.slug], window.innerWidth >= 900 ? POSE[s.slug] : { ...POSE[s.slug], x: 0, dim: 0.35 });
          },
        });
      });
      zone(".v5-engage", "mark", { x: 0, y: 0.1, scale: 1.1, dim: 0.35 });

      const go = () => {
        const id = decodeURIComponent(location.hash.slice(1));
        const target = id && el.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
        if (!target) return;
        if (lenisRef.current) lenisRef.current.scrollTo(target, { offset: -100, duration: 1.6 });
        else target.scrollIntoView();
      };

      if (reducedMotion()) {
        go();
        return;
      }
      const split = SplitText.create(".v5-sub__title", { type: "words,chars", charsClass: "ch" });
      gsap.set(split.chars, { yPercent: 90, rotateX: -95, autoAlpha: 0, transformOrigin: "50% 100% -40px" });
      gsap.set(".v5-sub__lede, .v5-sub__head .v5-eyebrow", { autoAlpha: 0, y: 24 });
      const off = onPageEnter("v5", () => {
        gsap.timeline({ onComplete: go })
          .to(split.chars, { yPercent: 0, rotateX: 0, autoAlpha: 1, stagger: 0.04, duration: 1.2, ease: ease.out })
          .to(".v5-sub__lede, .v5-sub__head .v5-eyebrow", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: ease.out }, 0.4);
      });

      gsap.utils.toArray<HTMLElement>(".v5-svc").forEach((row) => {
        gsap.from(row.querySelectorAll(".v5-svc__n, h2, .v5-svc__promise, .v5-svc__body, .v5-svc__cols > *, .v5-svc__go"), {
          y: 50, autoAlpha: 0, stagger: 0.07, duration: 1, ease: ease.out,
          scrollTrigger: { trigger: row, start: "top 80%" },
        });
        // a bar beside the row fills as you read it
        gsap.fromTo(row.querySelector(".v5-svc__bar i"), { scaleY: 0 }, {
          scaleY: 1, ease: "none",
          scrollTrigger: { trigger: row, start: "top 60%", end: "bottom 40%", scrub: true },
        });
      });

      /* promise cards tilt toward the pointer and catch a glare */
      const offs = [off, tilt(el, ".v5-tilt")];
      gsap.from(".v5-tilt", { y: 80, autoAlpha: 0, stagger: 0.1, duration: 1.1, ease: ease.out, scrollTrigger: { trigger: ".v5-engage", start: "top 75%" } });
      return () => offs.forEach((f) => f());
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v5-page v5-sub">
      <header className="v5-sub__head">
        <p className="v5-eyebrow">Core Service Architecture · 0{services.length} disciplines</p>
        <h1 className="v5-sub__title">Services</h1>
        <p className="v5-sub__lede">
          Four disciplines, one accountable team. From the first wireframe to a system that talks to the rest of
          your stack, each one rebuilds the light behind this page.
        </p>
      </header>

      <div className="v5-svcs">
        <aside className="v5-svcs__now" aria-hidden="true">
          <span className="v5-svcs__big" key={now}>0{now + 1}</span>
          <b>{services[now].name}</b>
          <small>{LOOK[services[now].slug]}</small>
        </aside>
        <div className="v5-svcs__list">
          {services.map((s, i) => (
            <section key={s.slug} id={s.slug} className="v5-svc" aria-labelledby={`v5-svc-${s.slug}`}>
              <span className="v5-svc__bar" aria-hidden="true"><i /></span>
              <p className="v5-svc__n">0{i + 1} · {s.tag}</p>
              <h2 id={`v5-svc-${s.slug}`}>{s.name}</h2>
              <p className="v5-svc__promise">{s.promise}</p>
              <p className="v5-svc__body">{s.short}</p>
              <div className="v5-svc__cols">
                <div>
                  <h3>Core capabilities</h3>
                  <ol role="list" className="v5-svc__nums">
                    {s.highlights.map((h, k) => (
                      <li key={h}><small>{String(i * 3 + k + 1).padStart(2, "0")}</small>{h}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3>Usually built with</h3>
                  <ul role="list" className="v5-chips">{s.stack.map((d) => <li key={d}>{d}</li>)}</ul>
                </div>
              </div>
              <TLink href={`/v5/services/${s.slug}`} className="v5-btn v5-svc__go" label={s.name}>
                <span>Read more</span><i aria-hidden="true">→</i>
              </TLink>
            </section>
          ))}
        </div>
      </div>

      <section className="v5-engage" aria-labelledby="v5-engage-title">
        <h2 id="v5-engage-title">Every engagement, every service</h2>
        <div className="v5-engage__grid">
          {promises.map((e, i) => (
            <article key={e.name} className="v5-tilt">
              <span className="v5-tilt__n">0{i + 1}</span>
              <h3>{e.name}</h3>
              <p>{e.body}</p>
            </article>
          ))}
        </div>
        <p className="v5-sub__note">
          All four run on the same {process.length}-stage cycle, from {process[0].name.toLowerCase()} to{" "}
          {process[process.length - 1].name.toLowerCase()}, and back again.{" "}
          <TLink href="/v5/process" className="v5-link" label="Process">See how we work</TLink>
        </p>
      </section>
    </div>
  );
}
