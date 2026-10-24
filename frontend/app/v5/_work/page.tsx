"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ProjectCover } from "@/components/ui/Fragments";
import { useLenis } from "@/components/motion/SmoothScroll";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, Flip, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { projects, type Project } from "@/lib/content";
import { scatter, shock, zone } from "../field";
import { tilt } from "../tilt";

const filters = ["All", ...Array.from(new Set(projects.map((p) => p.sector.split(" · ")[1])))];

export default function LumenWork() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<Project | null>(null);
  const flipGrid = useRef<Flip.FlipState | null>(null);
  const flipOpen = useRef<Flip.FlipState | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = root.current!;
      zone(".v5-sub__head", "nebula", { warp: 1, dim: 0.75 }, { warp: 1, dim: 0.5 });
      zone(".v5-cases", "nebula", { dim: 0.4, scale: 1.3 });
      const offs = [tilt(el, ".v5-case", 7)];
      if (reducedMotion()) return () => offs.forEach((f) => f());

      const split = SplitText.create(".v5-sub__title", { type: "words,chars", charsClass: "ch" });
      gsap.set(split.chars, { yPercent: 90, rotateX: -95, autoAlpha: 0, transformOrigin: "50% 100% -40px" });
      gsap.set(".v5-sub__lede, .v5-sub__head .v5-eyebrow, .v5-filter", { autoAlpha: 0, y: 24 });
      gsap.set(".v5-case", { autoAlpha: 0, y: 120, rotateX: -25, transformPerspective: 900 });
      offs.push(
        onPageEnter("v5", () =>
          gsap.timeline()
            .to(split.chars, { yPercent: 0, rotateX: 0, autoAlpha: 1, stagger: 0.05, duration: 1.2, ease: ease.out })
            .to(".v5-sub__lede, .v5-sub__head .v5-eyebrow, .v5-filter", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.04, ease: ease.out }, 0.4)
            .to(".v5-case", { autoAlpha: 1, y: 0, rotateX: 0, stagger: 0.09, duration: 1.3, ease: ease.out }, 0.5),
        ),
      );
      return () => offs.forEach((f) => f());
    },
    { scope: root },
  );

  /* filter changes animate from the previous layout */
  useGSAP(
    () => {
      if (!flipGrid.current) return;
      scatter(0.35, 1.2);
      Flip.from(flipGrid.current, {
        duration: 0.9, ease: ease.out, absolute: true, scale: true, stagger: 0.03,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.6, rotateY: -40 }, { autoAlpha: 1, scale: 1, rotateY: 0, duration: 0.8, ease: ease.out }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.6, rotateY: 40, duration: 0.5 }),
      });
      flipGrid.current = null;
    },
    { scope: root, dependencies: [filter] },
  );

  /* a case opens out of its card: the cover flies to full size */
  useGSAP(
    () => {
      const state = flipOpen.current;
      flipOpen.current = null;
      if (open) {
        lenis?.stop();
        root.current!.querySelector<HTMLElement>(".v5-detail__close")?.focus();
      } else {
        lenis?.start();
      }
      if (!state || reducedMotion()) return;
      const id = state.idLookup ? Object.keys(state.idLookup)[0] : "";
      const target = root.current!.querySelector<HTMLElement>(open ? `.v5-detail [data-flip-id="${id}"]` : `.v5-case [data-flip-id="${id}"]`);
      if (!target) return;
      Flip.from(state, { targets: target, duration: 0.9, ease: "expo.inOut", absolute: true, zIndex: 120 });
      if (open) {
        gsap.fromTo(".v5-detail__scrim", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 });
        gsap.fromTo(".v5-detail__meta > *", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.9, delay: 0.45, ease: ease.out });
      }
    },
    { scope: root, dependencies: [open] },
  );

  const close = () => {
    const cover = root.current?.querySelector(".v5-detail__cover");
    if (cover && !reducedMotion()) flipOpen.current = Flip.getState(cover);
    setOpen(null);
    requestAnimationFrame(() => opener.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  });

  const choose = (f: string) => {
    if (f === filter) return;
    if (!reducedMotion()) flipGrid.current = Flip.getState(root.current!.querySelectorAll(".v5-case"));
    setFilter(f);
  };

  const show = (p: Project, e: MouseEvent<HTMLButtonElement>) => {
    opener.current = e.currentTarget;
    const cover = e.currentTarget.closest(".v5-case")?.querySelector(".v5-case__cover");
    if (cover && !reducedMotion()) flipOpen.current = Flip.getState(cover);
    shock(e.clientX, e.clientY);
    setOpen(p);
  };

  return (
    <div ref={root} className="v5-page v5-sub">
      <header className="v5-sub__head">
        <p className="v5-eyebrow">Work · concept builds</p>
        <h1 className="v5-sub__title">Work</h1>
        <p className="v5-sub__lede">
          Concept projects that show the kind of systems we build. Open one to see it up close. Real case studies
          are available on request under NDA.
        </p>
        <div className="v5-filters" role="group" aria-label="Filter by type">
          {filters.map((f) => (
            <button key={f} className="v5-filter" aria-pressed={filter === f} onClick={() => choose(f)}>{f}</button>
          ))}
        </div>
      </header>

      <div className="v5-cases">
        {projects.map((p, i) => {
          const on = filter === "All" || p.sector.endsWith(filter);
          return (
            <article key={p.slug} className="v5-case" data-flip-id={p.slug} data-cursor="view" hidden={!on}>
              <div className="v5-case__cover" data-flip-id={`cover-${p.slug}`} style={{ visibility: open?.slug === p.slug ? "hidden" : undefined }}>
                <ProjectCover kind={p.cover} />
              </div>
              <div className="v5-case__meta">
                <span className="v5-case__n">0{i + 1}</span>
                <h2 className="v5-case__name">{p.name}</h2>
                <p className="v5-case__sum">{p.summary}</p>
                <span className="v5-case__tag">{p.sector} · Concept</span>
              </div>
              <span className="v5-case__glare" aria-hidden="true" />
              <button type="button" className="v5-case__hit" onClick={(e) => show(p, e)} aria-haspopup="dialog">
                <span className="sr-only">Open {p.name}</span>
              </button>
            </article>
          );
        })}
      </div>

      {open && (
        <div className="v5-detail" role="dialog" aria-modal="true" aria-labelledby="v5-detail-title" data-lenis-prevent>
          <div className="v5-detail__scrim" onClick={close} />
          <div className="v5-detail__box">
            <div className="v5-detail__cover" data-flip-id={`cover-${open.slug}`}>
              <ProjectCover kind={open.cover} />
            </div>
            <div className="v5-detail__meta">
              <p className="v5-eyebrow">{open.sector} · {open.year} · Concept</p>
              <h2 id="v5-detail-title">{open.name}</h2>
              <p>{open.summary}</p>
              <dl>
                <div><dt>Result</dt><dd>{open.outcome}</dd></div>
                <div><dt>Stack</dt><dd>{open.stack.join(", ")}</dd></div>
              </dl>
              <p className="v5-detail__note">Sample project for layout. Illumia will replace it with a real case study.</p>
              <button className="v5-btn v5-detail__close" onClick={close}><span>Close</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
