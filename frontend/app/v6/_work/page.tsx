"use client";

import { useEffect, useRef, useState } from "react";
import { ProjectCover } from "@/components/ui/Fragments";
import { useLenis } from "@/components/motion/SmoothScroll";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { projects, type Project } from "@/lib/content";
import { Board } from "../Board";
import { burst, zone } from "../flux";
import { chime } from "../sound";

export default function FluxWork() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [open, setOpen] = useState<Project | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const show = (p: Project) => {
    opener.current = document.activeElement as HTMLElement;
    setOpen(p);
    burst(window.innerWidth / 2, window.innerHeight / 2, 22, 70, 0.9);
    chime();
  };
  const close = () => {
    setOpen(null);
    requestAnimationFrame(() => opener.current?.focus?.());
  };

  useGSAP(
    () => {
      zone(".v6-sub__head", "storm", 0.5);
      zone(".v6-workboard", "storm", 0.35);
      zone(".v6-list", "calm", 0.5);
      // arriving from a tile elsewhere opens that project
      const fromHash = () => {
        const p = projects.find((x) => x.slug === decodeURIComponent(location.hash.slice(1)));
        if (p) show(p);
      };
      if (reducedMotion()) {
        fromHash();
        return;
      }
      const split = SplitText.create(".v6-sub__title", { type: "chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 120, skewY: 12 });
      gsap.set(".v6-sub__lede, .v6-sub__head .v6-eyebrow, .v6-workboard", { autoAlpha: 0, y: 40 });
      return onPageEnter("v6", () =>
        gsap.timeline({ onComplete: fromHash })
          .to(split.chars, { yPercent: 0, skewY: 0, stagger: 0.05, duration: 1.2, ease: ease.out })
          .to(".v6-sub__lede, .v6-sub__head .v6-eyebrow", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: ease.out }, 0.4)
          .to(".v6-workboard", { autoAlpha: 1, y: 0, duration: 1.2, ease: ease.out }, 0.5),
      );
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (open) lenis?.stop();
      else lenis?.start();
      if (!open) return;
      root.current!.querySelector<HTMLElement>(".v6-detail__close")?.focus();
      if (reducedMotion()) return;
      gsap.timeline()
        .fromTo(".v6-detail__scrim", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 })
        .fromTo(".v6-detail__box", { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(120% at 50% 50%)", duration: 1, ease: ease.wipe }, 0)
        .fromTo(".v6-detail__cover", { scale: 1.3, rotate: -4 }, { scale: 1, rotate: 0, duration: 1.4, ease: ease.out }, 0)
        .fromTo(".v6-detail__meta > *", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.9, ease: ease.out }, 0.35);
    },
    { scope: root, dependencies: [open, lenis] },
  );

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  });

  return (
    <div ref={root} className="v6-page v6-sub">
      <header className="v6-sub__head">
        <p className="v6-eyebrow">Work · concept builds</p>
        <h1 className="v6-sub__title">Work</h1>
        <p className="v6-sub__lede">
          Throw the board around; it never ends. Click a build to open it. These are concept projects; real case
          studies are available on request under NDA.
        </p>
      </header>

      <div className="v6-workboard">
        <Board
          height="86vh"
          label="All projects board"
          items={projects.map((p) => ({ key: p.slug, kicker: `${p.sector} · Concept`, title: p.name, lines: [p.summary], art: <ProjectCover kind={p.cover} /> }))}
          onOpen={(t) => show(projects.find((p) => p.slug === t.key)!)}
        />
      </div>

      <section className="v6-list" aria-labelledby="v6-list-title">
        <h2 id="v6-list-title">Or, as a list</h2>
        <ul role="list">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <button type="button" onClick={() => show(p)}>
                <span className="v6-list__n">0{i + 1}</span>
                <span className="v6-list__name">{p.name}</span>
                <span className="v6-list__sum">{p.summary}</span>
                <span className="v6-list__tag">{p.sector}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {open && (
        <div className="v6-detail" role="dialog" aria-modal="true" aria-labelledby="v6-detail-title" data-lenis-prevent>
          <div className="v6-detail__scrim" onClick={close} />
          <div className="v6-detail__box">
            <div className="v6-detail__cover"><ProjectCover kind={open.cover} /></div>
            <div className="v6-detail__meta">
              <p className="v6-eyebrow">{open.sector} · {open.year} · Concept</p>
              <h2 id="v6-detail-title">{open.name}</h2>
              <p>{open.summary}</p>
              <dl>
                <div><dt>Result</dt><dd>{open.outcome}</dd></div>
                <div><dt>Stack</dt><dd>{open.stack.join(", ")}</dd></div>
              </dl>
              <p className="v6-detail__note">Sample project for layout. Illumia will replace it with a real case study.</p>
              <button className="v6-btn v6-detail__close" onClick={close}><span>Close</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
