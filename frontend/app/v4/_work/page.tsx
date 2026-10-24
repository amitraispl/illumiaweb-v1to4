"use client";

import { useRef } from "react";
import { ProjectCover } from "@/components/ui/Fragments";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { projects } from "@/lib/content";

export default function BlueprintWork() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v4-sub__title", { type: "lines", mask: "lines", linesClass: "ln" });
      gsap.set(t.lines, { yPercent: 105 });
      const off = onPageEnter("v4", () => gsap.to(t.lines, { yPercent: 0, duration: 1.4, stagger: 0.1, ease: ease.out }));

      /* full-bleed plates: picture opens from a narrow window to the full width, slowly */
      gsap.utils.toArray<HTMLElement>(".v4-plate").forEach((p) => {
        gsap.fromTo(p.querySelector(".v4-plate__img"), { clipPath: "inset(18% 22% 18% 22%)" }, {
          clipPath: "inset(0% 0% 0% 0%)", ease: "none",
          scrollTrigger: { trigger: p, start: "top 90%", end: "center 55%", scrub: true },
        });
        gsap.fromTo(p.querySelector(".v4-plate__img > *"), { scale: 1.15 }, {
          scale: 1, ease: "none", scrollTrigger: { trigger: p, start: "top 90%", end: "center 55%", scrub: true },
        });
        gsap.from(p.querySelectorAll(".v4-plate__cap > *"), {
          y: 24, autoAlpha: 0, stagger: 0.1, duration: 1.1, ease: ease.out, scrollTrigger: { trigger: p, start: "center 70%" },
        });
      });
      return off;
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v4-page v4-sub">
      <header className="v4-sub__head">
        <h1 className="v4-sub__title">The view <em>from above</em></h1>
        <p className="v4-sub__lede">Concept builds, drawn to show the range. Client case studies are available on request.</p>
      </header>
      {projects.map((p) => (
        <article key={p.slug} className="v4-plate">
          <div className="v4-plate__img"><ProjectCover kind={p.cover} /></div>
          <div className="v4-plate__cap">
            <h2>{p.name}</h2>
            <p>{p.summary}</p>
            <dl>
              <div><dt>Sector</dt><dd>{p.sector}</dd></div>
              <div><dt>Outcome</dt><dd>{p.outcome}</dd></div>
              <div><dt>Built with</dt><dd>{p.stack.join(", ")}</dd></div>
            </dl>
          </div>
        </article>
      ))}
    </div>
  );
}
