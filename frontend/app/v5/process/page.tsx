"use client";

import { useRef, useState } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, ScrollTrigger, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { agile, intro, ownership, process } from "../content";
import { morph, scatter, zone } from "../field";
import { tilt } from "../tilt";

/** How we work: the seven-stage cycle, the sprints it runs in, and what you own at the end. */
export default function LumenProcess() {
  const root = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(0);

  useGSAP(
    () => {
      const el = root.current!;
      const wide = () => window.innerWidth >= 900;
      zone(".v5-sub__head", "cycle", { x: 0.45, scale: 1.05 }, { y: 0.36, scale: 0.8, dim: 0.5 });
      process.forEach((_, k) => {
        ScrollTrigger.create({
          trigger: `#stage-${k + 1}`, start: "top 55%", end: "bottom 45%", refreshPriority: -1,
          onToggle: (st) => {
            if (!st.isActive) return;
            setNow(k);
            // the loop leans a little further round with every stage, and pulses as it arrives
            morph("cycle", wide() ? { x: 0.5, y: 0.04 - k * 0.012, scale: 0.9 + k * 0.025 } : { y: 0.3, scale: 0.6, dim: 0.3 });
            scatter(0.14, 0.9);
          },
        });
      });
      zone(".v5-agile", "branches", { x: 0.42, y: 0.22, scale: 0.72, dim: 0.85 }, { y: 0.4, scale: 0.7, dim: 0.4 });
      zone(".v5-owns", "stack", { x: -0.45, scale: 0.75, dim: 0.7 }, { y: 0.4, scale: 0.6, dim: 0.4 });
      zone(".v5-closing", "mark", { scale: 1.15, dim: 0.4 });
      const offs = [tilt(el, ".v5-tilt")];

      if (reducedMotion()) return () => offs.forEach((f) => f());

      const split = SplitText.create(".v5-sub__title", { type: "words,chars", charsClass: "ch" });
      gsap.set(split.chars, { yPercent: 90, rotateX: -95, autoAlpha: 0, transformOrigin: "50% 100% -40px" });
      gsap.set(".v5-sub__lede, .v5-sub__head .v5-eyebrow", { autoAlpha: 0, y: 24 });
      offs.push(
        onPageEnter("v5", () => {
          gsap.timeline()
            .to(split.chars, { yPercent: 0, rotateX: 0, autoAlpha: 1, stagger: 0.03, duration: 1.2, ease: ease.out })
            .to(".v5-sub__lede, .v5-sub__head .v5-eyebrow", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: ease.out }, 0.4);
        }),
      );

      gsap.utils.toArray<HTMLElement>(".v5-svc").forEach((row) => {
        gsap.from(row.querySelectorAll(".v5-svc__n, h2, .v5-svc__body"), {
          y: 50, autoAlpha: 0, stagger: 0.07, duration: 1, ease: ease.out,
          scrollTrigger: { trigger: row, start: "top 80%" },
        });
        gsap.fromTo(row.querySelector(".v5-svc__bar i"), { scaleY: 0 }, {
          scaleY: 1, ease: "none",
          scrollTrigger: { trigger: row, start: "top 60%", end: "bottom 40%", scrub: true },
        });
      });

      gsap.from(".v5-agile .v5-tilt", {
        y: 80, autoAlpha: 0, stagger: 0.1, duration: 1.1, ease: ease.out,
        scrollTrigger: { trigger: ".v5-agile__grid", start: "top 80%" },
      });
      gsap.from(".v5-owns__list li", {
        x: 40, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: ease.out,
        scrollTrigger: { trigger: ".v5-owns__list", start: "top 80%" },
      });

      const words = SplitText.create(".v5-closing p", { type: "words" });
      gsap.fromTo(words.words, { opacity: 0.08, filter: "blur(8px)", y: 12 }, {
        opacity: 1, filter: "blur(0px)", y: 0, stagger: 0.06, ease: "none",
        scrollTrigger: { trigger: ".v5-closing", start: "top 80%", end: "bottom 60%", scrub: true },
      });

      return () => offs.forEach((f) => f());
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v5-page v5-sub">
      <header className="v5-sub__head">
        <p className="v5-eyebrow">How we work · {process.length} stages, every sprint</p>
        <h1 className="v5-sub__title v5-sub__title--svc">A cycle, not a straight line.</h1>
        <p className="v5-sub__lede">
          Discovery doesn&rsquo;t end when design starts, and testing doesn&rsquo;t wait for the end. Every stage
          stays open to what the next one learns, and your team reviews and weighs in throughout, not just at
          kickoff and handoff.
        </p>
      </header>

      <div className="v5-svcs">
        <aside className="v5-svcs__now" aria-hidden="true">
          <span className="v5-svcs__big" key={now}>0{now + 1}</span>
          <b>{process[now].name}</b>
          <small>{now === process.length - 1 ? "↺ feeds back into discover" : `stage ${now + 1} of ${process.length}`}</small>
        </aside>
        <ol className="v5-svcs__list" role="list">
          {process.map((p, k) => (
            <li key={p.name} id={`stage-${k + 1}`} className="v5-svc">
              <span className="v5-svc__bar" aria-hidden="true"><i /></span>
              <p className="v5-svc__n">0{k + 1}</p>
              <h2>{p.name}</h2>
              <p className="v5-svc__body">{p.body}</p>
            </li>
          ))}
          <li className="v5-loopback" aria-hidden="true">↺ Iterate feeds straight back into Discover</li>
        </ol>
      </div>

      <section className="v5-agile" aria-labelledby="v5-agile-title">
        <div className="v5-agile__text">
          <p className="v5-eyebrow">Agile Delivery</p>
          <h2 id="v5-agile-title">{agile.title}</h2>
          <p>{agile.body}</p>
        </div>
        <div className="v5-agile__grid">
          {agile.points.map((x, i) => (
            <article key={x.name} className="v5-tilt">
              <span className="v5-tilt__n">0{i + 1}</span>
              <h3>{x.name}</h3>
              <p>{x.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="v5-owns" aria-labelledby="v5-owns-title">
        <div className="v5-owns__text">
          <p className="v5-eyebrow">Full Transparency</p>
          <h2 id="v5-owns-title">Own everything you pay for.</h2>
          <ul className="v5-owns__list" role="list">
            {ownership.map((o, i) => (
              <li key={o.name}>
                <small>0{i + 1}</small>
                <div>
                  <h3>{o.name}</h3>
                  <p>{o.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="v5-manifesto v5-closing" aria-label="Our philosophy">
        <blockquote>
          <p>{intro.philosophy}</p>
          <footer>Illumia Software Development Philosophy</footer>
        </blockquote>
        <TLink href="/v5/services" className="v5-link" label="Services">Explore the four services</TLink>
      </section>
    </div>
  );
}
