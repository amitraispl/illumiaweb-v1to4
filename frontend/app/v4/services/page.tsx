"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { services } from "@/lib/content";

export default function BlueprintServices() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v4-sub__title", { type: "lines", mask: "lines", linesClass: "ln" });
      gsap.set(t.lines, { yPercent: 105 });
      gsap.set(".v4-sub__lede", { autoAlpha: 0, y: 20 });
      const off = onPageEnter("v4", () =>
        gsap
          .timeline()
          .to(t.lines, { yPercent: 0, duration: 1.4, stagger: 0.1, ease: ease.out })
          .to(".v4-sub__lede", { autoAlpha: 1, y: 0, duration: 1.1, ease: ease.out }, 0.5),
      );

      /* each room: the plate opens from its centre line, the text follows */
      gsap.utils.toArray<HTMLElement>(".v4-room").forEach((r) => {
        gsap.fromTo(r.querySelector(".v4-room__plate"), { clipPath: "inset(0 50% 0 50%)" }, {
          clipPath: "inset(0 0% 0 0%)", duration: 1.6, ease: ease.wipe, scrollTrigger: { trigger: r, start: "top 80%" },
        });
        gsap.from(r.querySelectorAll(".v4-room__text > *"), {
          y: 30, autoAlpha: 0, stagger: 0.1, duration: 1.2, ease: ease.out, scrollTrigger: { trigger: r, start: "top 70%" },
        });
      });
      return off;
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v4-page v4-sub">
      <header className="v4-sub__head">
        <h1 className="v4-sub__title">Six practices, <em>one</em> standard</h1>
        <p className="v4-sub__lede">Every practice is held to the same rule: documented, tested, secured, and handed over so your team can run it.</p>
      </header>

      {services.map((s, i) => (
        <section key={s.slug} id={s.slug} className="v4-room" aria-labelledby={`r-${s.slug}`}>
          <div className="v4-room__plate">
            <p className="v4-room__name" aria-hidden="true">{s.name}</p>
            <ul role="list">{s.stack.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          <div className="v4-room__text">
            <p className="v4-room__line"><em>Practice {i + 1} of {services.length}</em></p>
            <h2 id={`r-${s.slug}`}>{s.name}</h2>
            <p>{s.body}</p>
            <ul role="list" className="v4-room__list">{s.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>
          </div>
        </section>
      ))}

      <section className="v4-sub__close">
        <h2>Start with the foundation</h2>
        <p>A two-week discovery sprint gives you a brief, a prototype and a fixed quote.</p>
        <TLink href="/v4/contact" className="v4-btn" label="Contact">Plan your build</TLink>
      </section>
    </div>
  );
}
