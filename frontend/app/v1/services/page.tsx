"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, ScrollTrigger, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { services, process } from "@/lib/content";

export default function BeaconServices() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const split = SplitText.create(".v1-sub__title", { type: "chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 110 });
      gsap.set(".v1-sub__lede", { autoAlpha: 0, y: 20 });
      const off = onPageEnter("v1", () =>
        gsap
          .timeline()
          .to(split.chars, { yPercent: 0, stagger: 0.03, duration: 1, ease: ease.out })
          .to(".v1-sub__lede", { autoAlpha: 1, y: 0, duration: 0.8, ease: ease.out }, 0.4),
      );

      /* each service row lights up while it crosses the middle of the screen */
      gsap.utils.toArray<HTMLElement>(".v1-svc").forEach((row) => {
        ScrollTrigger.create({
          trigger: row, start: "top 60%", end: "bottom 40%",
          toggleClass: { targets: row, className: "is-lit" },
        });
        gsap.from(row.querySelectorAll(".v1-svc__name, .v1-svc__body, .v1-svc__cols > *"), {
          y: 36, autoAlpha: 0, stagger: 0.07, duration: 0.9, ease: ease.out,
          scrollTrigger: { trigger: row, start: "top 80%" },
        });
      });

      /* the scan line follows the reader down the list */
      gsap.to(".v1-svcs__scan", {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: ".v1-svcs", start: "top 50%", end: "bottom 50%", scrub: true },
      });
      return off;
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v1-page v1-sub">
      <header className="v1-sub__head">
        <h1 className="v1-sub__title">Services</h1>
        <p className="v1-sub__lede">
          Six practices, one team. Pick the one you need today; we will carry it all the way to production
          and keep it running.
        </p>
      </header>

      <div className="v1-svcs">
        <span className="v1-svcs__scan" aria-hidden="true" />
        {services.map((s) => (
          <section key={s.slug} className="v1-svc" id={s.slug} aria-labelledby={`svc-${s.slug}`}>
            <h2 id={`svc-${s.slug}`} className="v1-svc__name">{s.name}</h2>
            <p className="v1-svc__body">{s.body}</p>
            <div className="v1-svc__cols">
              <div>
                <h3>What you get</h3>
                <ul role="list">{s.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>
              </div>
              <div>
                <h3>Usually built with</h3>
                <ul role="list" className="v1-chips">{s.stack.map((d) => <li key={d}>{d}</li>)}</ul>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="v1-sub__band" aria-labelledby="v1-engage">
        <h2 id="v1-engage">Three ways to start</h2>
        <div className="v1-engage">
          <article>
            <h3>Discovery sprint</h3>
            <p>Two weeks, a written brief, a clickable prototype and a fixed quote for the build.</p>
          </article>
          <article>
            <h3>Product team</h3>
            <p>A designer, engineers and a lead who ship with you every sprint, for as long as you need.</p>
          </article>
          <article>
            <h3>Rescue and support</h3>
            <p>We take over a system someone else built, stabilise it, then improve it. 24/7 if needed.</p>
          </article>
        </div>
        <p className="v1-sub__note">
          Every engagement follows the same {process.length} stages, from {process[0].name.toLowerCase()} to{" "}
          {process[process.length - 1].name.toLowerCase()}.{" "}
          <TLink href="/v1/contact" className="v1-link" label="Contact">Talk to an engineer</TLink>
        </p>
      </section>
    </div>
  );
}
