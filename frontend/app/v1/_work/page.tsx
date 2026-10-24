"use client";

import { useRef, useState } from "react";
import { ProjectCover } from "@/components/ui/Fragments";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, Flip, SplitText, useGSAP, ease, reducedMotion, finePointer } from "@/lib/gsap";
import { projects } from "@/lib/content";

const filters = ["All", ...Array.from(new Set(projects.map((p) => p.sector.split(" · ")[1])))];

export default function BeaconWork() {
  const root = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState("All");
  const flipState = useRef<Flip.FlipState | null>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const split = SplitText.create(".v1-sub__title", { type: "chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 110 });
      gsap.set(".v1-case", { autoAlpha: 0, y: 60 });
      const off = onPageEnter("v1", () =>
        gsap
          .timeline()
          .to(split.chars, { yPercent: 0, stagger: 0.03, duration: 1, ease: ease.out })
          .to(".v1-case", { autoAlpha: 1, y: 0, stagger: 0.08, duration: 1, ease: ease.out }, 0.3),
      );

      /* the cover stays dark until the pointer lights it */
      if (!finePointer()) return off;
      const cards = gsap.utils.toArray<HTMLElement>(".v1-case");
      const handlers = cards.map((c) => {
        const x = gsap.quickTo(c, "--lx", { duration: 0.4, ease: "power3.out" });
        const y = gsap.quickTo(c, "--ly", { duration: 0.4, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = c.getBoundingClientRect();
          x(e.clientX - r.left);
          y(e.clientY - r.top);
        };
        c.addEventListener("pointermove", move);
        return () => c.removeEventListener("pointermove", move);
      });
      return () => {
        off();
        handlers.forEach((h) => h());
      };
    },
    { scope: root },
  );

  /* filter changes animate with Flip from the previous layout */
  useGSAP(
    () => {
      if (!flipState.current) return;
      Flip.from(flipState.current, {
        duration: 0.8, ease: ease.out, absolute: true, scale: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.6 }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.9, duration: 0.4 }),
      });
      flipState.current = null;
    },
    { scope: root, dependencies: [filter] },
  );

  const choose = (f: string) => {
    if (f === filter) return;
    if (!reducedMotion()) flipState.current = Flip.getState(root.current!.querySelectorAll(".v1-case"));
    setFilter(f);
  };

  return (
    <div ref={root} className="v1-page v1-sub">
      <header className="v1-sub__head">
        <h1 className="v1-sub__title">Work</h1>
        <p className="v1-sub__lede">
          Concept projects that show the kind of systems we build. Real case studies are available on request
          under NDA.
        </p>
      </header>

      <div className="v1-filters" role="group" aria-label="Filter by type">
        {filters.map((f) => (
          <button key={f} className="v1-filter" aria-pressed={filter === f} onClick={() => choose(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="v1-cases">
        {projects.map((p) => {
          const show = filter === "All" || p.sector.endsWith(filter);
          return (
            <article key={p.slug} className="v1-case" data-flip-id={p.slug} data-cursor="view" hidden={!show}>
              <div className="v1-case__cover"><ProjectCover kind={p.cover} /></div>
              <div className="v1-case__meta">
                <h2>{p.name}</h2>
                <p>{p.summary}</p>
                <dl>
                  <div><dt>Sector</dt><dd>{p.sector}</dd></div>
                  <div><dt>Result</dt><dd>{p.outcome}</dd></div>
                  <div><dt>Stack</dt><dd>{p.stack.join(", ")}</dd></div>
                </dl>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
