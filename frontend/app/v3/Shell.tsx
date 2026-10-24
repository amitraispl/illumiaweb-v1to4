"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { clearEnter, signalEnter } from "@/components/motion/onEnter";
import { TLink, TransitionProvider, type TransitionHooks } from "@/components/motion/Transition";
import { gsap, useGSAP, ease, finePointer, reducedMotion } from "@/lib/gsap";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { company, navFor, pages, services } from "@/lib/copy";

const nav = navFor("v3");

/* "Pause motion": stops every looping animation on the page (WCAG 2.2.2) */
const MotionContext = createContext(true);
export const useMotionOn = () => useContext(MotionContext);

export function Shell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [motionOn, setMotionOn] = useState(true);

  /* pages pause their own GSAP loops via useMotionOn(); CSS loops read this class */
  useEffect(() => {
    document.documentElement.classList.toggle("v3-paused", !motionOn);
    return () => document.documentElement.classList.remove("v3-paused");
  }, [motionOn]);

  /* a crimson block sweeps across on a skew, carrying the destination in wide type */
  const hooks = useMemo<TransitionHooks>(
    () => ({
      cover: (_href, label) =>
        new Promise<void>((resolve) => {
          clearEnter("v3");
          const el = root.current;
          if (!el) return resolve();
          el.querySelector<HTMLElement>(".v3-sweep__word")!.textContent = label || "Illumia";
          gsap
            .timeline({ onComplete: resolve })
            .set(".v3-sweep", { visibility: "visible" })
            .fromTo(".v3-sweep__block", { xPercent: -120, skewX: -12 }, { xPercent: 0, skewX: 0, duration: 0.8, ease: ease.wipe, stagger: 0.08 })
            .fromTo(".v3-sweep__word", { "--w": 62, autoAlpha: 0 }, { "--w": 125, autoAlpha: 1, duration: 0.6, ease: ease.out }, "-=0.35");
        }),
      reveal: (first) =>
        new Promise<void>((resolve) => {
          const el = root.current;
          if (!el) return resolve();
          const tl = gsap.timeline({ onComplete: resolve });
          const seen = sessionStorage.getItem("v3-loaded");
          sessionStorage.setItem("v3-loaded", "1");
          if (first && seen) {
            // intro already played this session; a zero-length timeline would not fire its callbacks
            tl.kill();
            gsap.set([".v3-intro", ".v3-sweep"], { autoAlpha: 0 });
            signalEnter("v3");
            return resolve();
          } else if (first) {
            /* first visit: a counter fills, then the curtain lifts */
            const n = { v: 0 };
            const num = el.querySelector<HTMLElement>(".v3-intro__n")!;
            tl.set(".v3-intro", { autoAlpha: 1 })
              .to(n, { v: 100, duration: 0.6, ease: "power2.inOut", onUpdate: () => (num.textContent = `${Math.round(n.v)}%`) })
              .to(".v3-intro__bar", { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, 0)
              .to(".v3-intro", { yPercent: -100, duration: 0.7, ease: ease.wipe })
              .set(".v3-intro", { autoAlpha: 0 })
              .set(".v3-sweep", { visibility: "hidden" }, 0);
          } else {
            tl.to(".v3-sweep__word", { autoAlpha: 0, duration: 0.2 })
              .to(".v3-sweep__block", { xPercent: 120, skewX: 12, duration: 0.8, ease: ease.wipe, stagger: 0.08 })
              .set(".v3-sweep", { visibility: "hidden" });
          }
          tl.add(() => signalEnter("v3"), first ? "-=0.6" : "-=0.6");
        }),
    }),
    [],
  );

  /* cursor ring with a label that reads the element under it */
  useGSAP(
    () => {
      if (!finePointer()) return;
      const c = root.current!.querySelector<HTMLElement>(".v3-cursor")!;
      gsap.set(c, { xPercent: -50, yPercent: -50, autoAlpha: 1 });
      const x = gsap.quickTo(c, "x", { duration: 0.3, ease: "power3.out" });
      const y = gsap.quickTo(c, "y", { duration: 0.3, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        x(e.clientX);
        y(e.clientY);
        const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, input, textarea, select");
        c.dataset.state = t?.dataset.cursor ? "word" : t ? "link" : "";
        c.querySelector("span")!.textContent = t?.dataset.cursor ?? "";
      };
      window.addEventListener("pointermove", move);
      return () => window.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  /* full-screen menu: panels drop in, links stretch from narrow to wide */
  useGSAP(
    () => {
      if (!menu || reducedMotion()) return;
      gsap
        .timeline()
        .from(".v3-menu__panel", { yPercent: -100, duration: 0.7, stagger: 0.06, ease: ease.wipe })
        .from(".v3-menu__link", { "--w": 62, yPercent: 100, duration: 0.9, stagger: 0.06, ease: ease.out }, "-=0.35")
        .from(".v3-menu__meta > *", { autoAlpha: 0, y: 20, stagger: 0.05, duration: 0.5 }, "-=0.6");
    },
    { scope: root, dependencies: [menu], revertOnUpdate: true },
  );

  return (
    <MotionContext.Provider value={motionOn}>
      <SmoothScroll duration={1}>
        <TransitionProvider hooks={hooks}>
          <div ref={root} className="v3-root">
            <a className="v3-skip" href="#main">Skip to content</a>
            <header className="v3-nav">
              <TLink href="/v3" label="Illumia" className="v3-nav__logo">
                <img className="v3-logo v3-logo--on-dark" src="/brand/illumia-logo-light.svg" alt="Illumia Solutions, home" width={140} height={38} />
                <img className="v3-logo v3-logo--on-light" src="/brand/illumia-logo-dark.svg" alt="Illumia Solutions, home" width={140} height={38} />
              </TLink>
              <div className="v3-nav__right">
                <ThemeToggle version="v3" className="v3-pill v3-pill--theme" />
                <button className="v3-pill v3-pill--motion" onClick={() => setMotionOn((m) => !m)} aria-pressed={!motionOn} aria-label={motionOn ? "Pause motion" : "Play motion"}>
                  <i aria-hidden="true" />
                  <span>{motionOn ? "Pause motion" : "Play motion"}</span>
                </button>
                <TLink href="/v3/contact" className="v3-pill v3-pill--solid" label="Contact">Start a project</TLink>
                <button className="v3-pill" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="v3-menu">
                  {menu ? "Close" : "Menu"}
                </button>
              </div>
            </header>

            <div id="v3-menu" className="v3-menu" hidden={!menu} role="dialog" aria-modal="true" aria-label="Menu">
              <div className="v3-menu__panel" />
              <div className="v3-menu__panel" />
              <nav aria-label="Menu" className="v3-menu__nav">
                {nav.map((n) => (
                  <div key={n.href} className="v3-menu__row">
                    <TLink
                      href={n.href}
                      className="v3-menu__link"
                      aria-current={pathname === n.href ? "page" : undefined}
                      onClick={() => setMenu(false)}
                      label={n.label}
                    >
                      {n.label}
                    </TLink>
                  </div>
                ))}
              </nav>
              <div className="v3-menu__meta">
                <a href={company.phoneHref}>{company.phone}</a>
                <a href={company.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                <span>Kolkata · India · USA · Philippines · Australia · Kenya · Nigeria</span>
              </div>
            </div>

            <main id="main">{children}</main>

            <footer className="v3-foot">
              <div className="v3-foot__grid">
                <img src="/brand/illumia-logo-light.svg" alt="Illumia Solutions" width={160} height={44} />
                <p className="v3-foot__about">{pages.footer.about}</p>
                <nav aria-label="Services">
                  {services.map((s) => <TLink key={s.slug} href={`/v3/services/${s.slug}`} label={s.name}>{s.name}</TLink>)}
                  <TLink href="/v3/process" label="Process">How we work</TLink>
                </nav>
                <div className="v3-foot__talk">
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                  <a href={company.phoneHref}>{company.phone}</a>
                  <address>{company.address.map((l) => <span key={l}>{l}</span>)}</address>
                </div>
              </div>
              <p className="v3-foot__word" aria-hidden="true">Illumia</p>
              <div className="v3-foot__base">
                <em>{company.tagline}</em>
                <span>{pages.footer.legal}</span>
                <a href="#main" className="v3-foot__top">Back to top</a>
              </div>
            </footer>

            <div className="v3-cursor" aria-hidden="true"><span /></div>
            <div className="v3-sweep" aria-hidden="true">
              <div className="v3-sweep__block" />
              <div className="v3-sweep__block"><p className="v3-sweep__word" /></div>
            </div>
            <div className="v3-intro" aria-hidden="true">
              <p className="v3-intro__line">Illumia Software</p>
              <p className="v3-intro__n">0%</p>
              <i className="v3-intro__bar" />
            </div>
          </div>
        </TransitionProvider>
      </SmoothScroll>
    </MotionContext.Provider>
  );
}
