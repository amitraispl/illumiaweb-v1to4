"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { clearEnter, signalEnter } from "@/components/motion/onEnter";
import { TLink, TransitionProvider, type TransitionHooks } from "@/components/motion/Transition";
import { Clock } from "@/components/motion/Clock";
import { gsap, useGSAP, ease, finePointer } from "@/lib/gsap";
import { company, navFor } from "@/lib/copy";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

const nav = navFor("v1");

/* The diamond: closed is a point at the centre, open covers the viewport. */
const DIAMOND_CLOSED = "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)";
const DIAMOND_OPEN = "polygon(50% -60%, 160% 50%, 50% 160%, -60% 50%)";

export function Shell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);

  const hooks = useMemo<TransitionHooks>(() => {
    const q = (s: string) => root.current?.querySelector<HTMLElement>(s);
    return {
      cover: (_href, label) =>
        new Promise<void>((resolve) => {
          clearEnter("v1");
          const veil = q(".v1-veil");
          const word = q(".v1-veil__word");
          if (!veil || !word) return resolve();
          word.textContent = label || "Loading";
          gsap
            .timeline({ onComplete: resolve })
            .set(veil, { visibility: "visible", clipPath: DIAMOND_CLOSED })
            .to(veil, { clipPath: DIAMOND_OPEN, duration: 0.85, ease: ease.wipe })
            .fromTo(word, { opacity: 0 }, { opacity: 1, duration: 0.2 }, "-=0.35")
            .to(word, { duration: 0.5, scrambleText: { text: label || "Loading", chars: "01<>/{}#", speed: 0.6 } }, "<");
        }),
      reveal: (first) =>
        new Promise<void>((resolve) => {
          const veil = q(".v1-veil");
          const loader = q(".v1-loader");
          if (!veil) return resolve();
          const tl = gsap.timeline({ onComplete: resolve });
          if (first && loader && !sessionStorage.getItem("v1-loaded")) {
            sessionStorage.setItem("v1-loaded", "1");
            const n = { v: 0 };
            const num = loader.querySelector<HTMLElement>(".v1-loader__n");
            tl.set(loader, { autoAlpha: 1 })
              .fromTo(".v1-loader__mark path", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.8, ease: "power2.inOut" }, 0)
              .to(n, { v: 100, duration: 0.8, ease: "power2.inOut", onUpdate: () => num && (num.textContent = String(Math.round(n.v)).padStart(3, "0")) }, 0)
              .to(loader, { clipPath: DIAMOND_CLOSED, duration: 0.6, ease: ease.wipe })
              .set(loader, { autoAlpha: 0 });
          } else if (first) {
            // loader already played this session; a zero-length timeline would not fire its callbacks
            tl.kill();
            if (loader) gsap.set(loader, { autoAlpha: 0 });
            gsap.set(veil, { visibility: "hidden" });
            signalEnter("v1");
            return resolve();
          }
          if (!first) {
            tl.to(veil, { clipPath: DIAMOND_CLOSED, duration: 0.8, ease: ease.wipe }).set(veil, { visibility: "hidden" });
          } else {
            gsap.set(veil, { visibility: "hidden" });
          }
          tl.add(() => signalEnter("v1"), first ? "-=0.4" : "-=0.5");
        }),
    };
  }, []);

  /* cursor: a small diamond that becomes a lens over links and work */
  useGSAP(
    () => {
      if (!finePointer()) return;
      const dot = root.current!.querySelector<HTMLElement>(".v1-cursor")!;
      gsap.set(dot, { xPercent: -50, yPercent: -50, autoAlpha: 1 });
      const x = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3.out" });
      const y = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        x(e.clientX);
        y(e.clientY);
        const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, input, textarea, label");
        const kind = t?.dataset.cursor ?? (t ? "link" : "");
        dot.dataset.state = kind;
        const txt = dot.querySelector("span");
        if (txt) txt.textContent = kind === "view" ? "View" : kind === "drag" ? "Drag" : "";
      };
      window.addEventListener("pointermove", move);
      return () => window.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  /* menu overlay: wipes down, links rise out of their masks */
  useGSAP(
    () => {
      if (!menu) return;
      gsap
        .timeline()
        .fromTo(".v1-menu", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: ease.wipe })
        .from(".v1-menu__link", { yPercent: 110, duration: 0.8, stagger: 0.07, ease: ease.out }, "-=0.3")
        .from(".v1-menu__meta > *", { autoAlpha: 0, y: 16, stagger: 0.06, duration: 0.5 }, "-=0.6");
    },
    { scope: root, dependencies: [menu], revertOnUpdate: true },
  );

  return (
    <SmoothScroll>
      <TransitionProvider hooks={hooks}>
        <div ref={root} className="v1-root">
          <a className="v1-skip" href="#main">Skip to content</a>
          <header className="v1-nav">
            <TLink href="/v1" className="v1-nav__logo" aria-label="Illumia Solutions, home">
              <img src="/brand/illumia-logo-light.svg" alt="Illumia Solutions" width={148} height={40} />
            </TLink>
            <nav aria-label="Main" className="v1-nav__links">
              {nav.slice(1).map((n) => (
                <TLink key={n.href} href={n.href} aria-current={pathname === n.href ? "page" : undefined}>
                  {n.label}
                </TLink>
              ))}
            </nav>
            <button className="v1-nav__menu" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="v1-menu">
              <span>{menu ? "Close" : "Menu"}</span>
              <i aria-hidden="true" />
            </button>
          </header>

          <div id="v1-menu" className="v1-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden={!menu}>
            <nav aria-label="Menu">
              <ul role="list">
                {nav.map((n) => (
                  <li key={n.href} className="v1-menu__row">
                    <TLink href={n.href} className="v1-menu__link" onClick={() => setMenu(false)} label={n.label}>
                      {n.label}
                    </TLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="v1-menu__meta">
              <p>Kolkata HQ · <Clock tz="Asia/Kolkata" /></p>
              <a href={company.phoneHref}>{company.phone}</a>
              <a href={company.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>

          <main id="main">{children}</main>
          <Footer />

          <div className="v1-cursor" aria-hidden="true"><span /></div>
          <div className="v1-veil" aria-hidden="true">
            <img src="/brand/illumia-mark.svg" alt="" width={56} height={56} />
            <p className="v1-veil__word" />
          </div>
          <div className="v1-loader" aria-hidden="true">
            <svg className="v1-loader__mark" viewBox="0 0 100 100" width="120" height="120">
              <path d="M50 4 L96 50 L50 96 L4 50 Z" />
              <path d="M50 22 L78 50 L50 78 L22 50 Z" />
            </svg>
            <p className="v1-loader__n">000</p>
          </div>
        </div>
      </TransitionProvider>
    </SmoothScroll>
  );
}
