"use client";

import { useRef } from "react";
import { ProjectCover } from "@/components/ui/Fragments";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { projects } from "@/lib/content";

export default function EditorialWork() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v2-sub__title", { type: "chars", mask: "chars", charsClass: "ch" });
      gsap.set(t.chars, { yPercent: 105 });
      const off = onPageEnter("v2", () => gsap.to(t.chars, { yPercent: 0, stagger: 0.04, duration: 1.1, ease: ease.out }));

      /* each spread: cover opens from the spine, title slides in from the gutter */
      gsap.utils.toArray<HTMLElement>(".v2-spread").forEach((sp, i) => {
        const fromLeft = i % 2 === 0;
        gsap.fromTo(sp.querySelector(".v2-spread__cover"),
          { clipPath: fromLeft ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" },
          { clipPath: "inset(0 0% 0 0%)", duration: 1.5, ease: ease.wipe, scrollTrigger: { trigger: sp, start: "top 80%" } });
        gsap.from(sp.querySelector(".v2-spread__cover > *"), {
          scale: 1.2, duration: 1.8, ease: ease.out, scrollTrigger: { trigger: sp, start: "top 80%" },
        });
        const title = SplitText.create(sp.querySelector("h2"), { type: "chars", mask: "chars", charsClass: "ch" });
        gsap.from(title.chars, {
          yPercent: 105, stagger: 0.03, duration: 1, ease: ease.out, scrollTrigger: { trigger: sp, start: "top 70%" },
        });
        gsap.from(sp.querySelectorAll(".v2-spread__text > :not(h2)"), {
          y: 24, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: ease.out, scrollTrigger: { trigger: sp, start: "top 65%" },
        });
      });
      return off;
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v2-page v2-sub">
      <header className="v2-sub__head">
        <h1 className="v2-sub__title">Selected <em>work</em></h1>
        <p className="v2-sub__lede">
          Concept projects, drawn to show the kind of systems we build. Client case studies are shared on request.
        </p>
      </header>

      {projects.map((p) => (
        <article key={p.slug} className="v2-spread" data-cursor="Concept">
          <div className="v2-spread__cover"><ProjectCover kind={p.cover} /></div>
          <div className="v2-spread__text">
            <h2>{p.name}</h2>
            <p className="v2-spread__sum">{p.summary}</p>
            <dl>
              <div><dt>Sector</dt><dd>{p.sector}</dd></div>
              <div><dt>Year</dt><dd>{p.year}</dd></div>
              <div><dt>Outcome</dt><dd>{p.outcome}</dd></div>
              <div><dt>Stack</dt><dd>{p.stack.join(", ")}</dd></div>
            </dl>
          </div>
        </article>
      ))}
    </div>
  );
}
