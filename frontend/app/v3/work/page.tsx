"use client";

import { useRef } from "react";
import { ProjectCover } from "@/components/ui/Fragments";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion, finePointer } from "@/lib/gsap";
import { projects } from "@/lib/content";

export default function KineticWork() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v3-sub__title", { type: "words,chars", charsClass: "k" });
      gsap.set(t.chars, { "--w": 62, yPercent: 100, autoAlpha: 0 });
      const off = onPageEnter("v3", () =>
        gsap.to(t.chars, { yPercent: 0, autoAlpha: 1, "--w": 125, duration: 1, stagger: 0.03, ease: ease.out }),
      );

      /* tiles flip up from the bottom edge as they arrive */
      gsap.utils.toArray<HTMLElement>(".v3-tile").forEach((tile, i) => {
        gsap.from(tile, {
          rotateX: -35, yPercent: 20, autoAlpha: 0, transformOrigin: "50% 100%", duration: 1.1, delay: (i % 2) * 0.1, ease: ease.out,
          scrollTrigger: { trigger: tile, start: "top 88%" },
        });
      });

      /* 3D tilt toward the pointer */
      if (!finePointer()) return off;
      const offs = gsap.utils.toArray<HTMLElement>(".v3-tile").map((tile) => {
        const rx = gsap.quickTo(tile, "rotateX", { duration: 0.6, ease: "power3.out" });
        const ry = gsap.quickTo(tile, "rotateY", { duration: 0.6, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = tile.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 10);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
        };
        const leave = () => { rx(0); ry(0); };
        tile.addEventListener("pointermove", move);
        tile.addEventListener("pointerleave", leave);
        return () => {
          tile.removeEventListener("pointermove", move);
          tile.removeEventListener("pointerleave", leave);
        };
      });
      return () => {
        off();
        offs.forEach((f) => f());
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v3-page v3-sub">
      <header className="v3-sub__head">
        <h1 className="v3-sub__title">Work</h1>
        <p className="v3-sub__lede">Concept builds that show the range. Client case studies are shared under NDA.</p>
      </header>
      <div className="v3-tiles">
        {projects.map((p, i) => (
          <article key={p.slug} className={`v3-tile v3-tile--${i % 3}`} data-cursor="Concept">
            <div className="v3-tile__cover"><ProjectCover kind={p.cover} /></div>
            <div className="v3-tile__meta">
              <h2>{p.name}</h2>
              <p>{p.summary}</p>
              <p className="v3-tile__out">{p.outcome}</p>
              <ul role="list" className="v3-svc__tags">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
