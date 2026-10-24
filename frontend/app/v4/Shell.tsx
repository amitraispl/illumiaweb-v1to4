"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { clearEnter, signalEnter } from "@/components/motion/onEnter";
import { TLink, TransitionProvider, type TransitionHooks } from "@/components/motion/Transition";
import { gsap, ScrollTrigger, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { company, navFor, pages, services } from "@/lib/copy";

const nav = navFor("v4");

export function Shell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);

  /* slow and architectural: a charcoal curtain closes from the edges, the mark breathes, it opens again */
  const hooks = useMemo<TransitionHooks>(
    () => ({
      cover: (_href, label) =>
        new Promise<void>((resolve) => {
          clearEnter("v4");
          const el = root.current;
          if (!el) return resolve();
          el.querySelector<HTMLElement>(".v4-curtain__word")!.textContent = label || "Illumia";
          gsap
            .timeline({ onComplete: resolve })
            .set(".v4-curtain", { visibility: "visible" })
            .fromTo(".v4-curtain", { clipPath: "inset(50% 0% 50% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: ease.wipe })
            .fromTo(".v4-curtain__inner > *", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.6, ease: ease.out }, "-=0.4")
            .fromTo(".v4-curtain__line", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "<");
        }),
      reveal: (first) =>
        new Promise<void>((resolve) => {
          const enter = () => signalEnter("v4");
          if (first) {
            // nothing to uncover on first load; a zero-length timeline would not fire its callbacks
            gsap.set(".v4-curtain", { visibility: "hidden" });
            enter();
            return resolve();
          }
          gsap
            .timeline({ onComplete: resolve })
            .to(".v4-curtain__inner > *", { autoAlpha: 0, y: -12, duration: 0.4, stagger: 0.05 })
            .to(".v4-curtain", { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: ease.wipe })
            .set(".v4-curtain", { visibility: "hidden" })
            .add(enter, "-=0.7");
        }),
    }),
    [],
  );

  /* scroll progress, as a percentage, like a floor indicator */
  useGSAP(
    () => {
      const out = root.current!.querySelector<HTMLElement>(".v4-progress__n")!;
      const bar = root.current!.querySelector<HTMLElement>(".v4-progress__bar")!;
      ScrollTrigger.create({
        start: 0, end: "max",
        onUpdate: (st) => {
          out.textContent = `${Math.round(st.progress * 100)}%`;
          bar.style.transform = `scaleY(${st.progress})`;
        },
      });
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      if (!menu || reducedMotion()) return;
      gsap
        .timeline()
        .fromTo(".v4-menu", { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 0.9, ease: ease.wipe })
        .from(".v4-menu__link", { yPercent: 100, autoAlpha: 0, stagger: 0.07, duration: 0.9, ease: ease.out }, "-=0.4");
    },
    { scope: root, dependencies: [menu], revertOnUpdate: true },
  );

  return (
    <SmoothScroll duration={1.5}>
      <TransitionProvider hooks={hooks}>
        <div ref={root} className="v4-root">
          <a className="v4-skip" href="#main">Skip to content</a>
          <header className="v4-nav">
            <button className="v4-nav__menu" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="v4-menu">
              <i aria-hidden="true" /><i aria-hidden="true" />
              <span>{menu ? "Close" : "Menu"}</span>
            </button>
            <TLink href="/v4" label="Illumia" className="v4-nav__logo">
              <img className="v4-logo v4-logo--on-dark" src="/brand/illumia-logo-light.svg" alt="Illumia Solutions, home" width={150} height={40} />
              <img className="v4-logo v4-logo--on-light" src="/brand/illumia-logo-dark.svg" alt="Illumia Solutions, home" width={150} height={40} />
            </TLink>
            <div className="v4-nav__end">
              <ThemeToggle version="v4" className="v4-nav__theme" />
              <TLink href="/v4/contact" className="v4-btn v4-btn--ghost" label="Contact">Enquire</TLink>
            </div>
          </header>

          <div className="v4-progress" aria-hidden="true">
            <span className="v4-progress__n">0%</span>
            <span className="v4-progress__track"><i className="v4-progress__bar" /></span>
          </div>

          <div id="v4-menu" className="v4-menu" hidden={!menu} role="dialog" aria-modal="true" aria-label="Menu">
            <nav aria-label="Menu">
              {nav.map((n) => (
                <div key={n.href} className="v4-menu__row">
                  <TLink href={n.href} className="v4-menu__link" aria-current={pathname === n.href ? "page" : undefined} onClick={() => setMenu(false)} label={n.label}>
                    {n.label}
                  </TLink>
                </div>
              ))}
            </nav>
            <div className="v4-menu__side">
              <p><em>{company.tagline}</em></p>
              <a href={company.phoneHref}>{company.phone}</a>
              <address>{company.address.join(", ")}</address>
            </div>
          </div>

          <main id="main">{children}</main>

          <footer className="v4-foot">
            <svg className="v4-foot__col v4-foot__col--l" viewBox="0 0 120 400" aria-hidden="true">
              <path d="M20 400V60l40-40 40 40v340M20 120h80M20 200h80M20 280h80M60 20v380" />
            </svg>
            <svg className="v4-foot__col v4-foot__col--r" viewBox="0 0 120 400" aria-hidden="true">
              <path d="M20 400V60l40-40 40 40v340M20 120h80M20 200h80M20 280h80M60 20v380" />
            </svg>
            <div className="v4-foot__inner">
              <img src="/brand/illumia-mark.svg" alt="" width={56} height={56} />
              <p className="v4-foot__tag"><em>{company.tagline}</em></p>
              <p className="v4-foot__ask">{pages.footer.ask} <TLink href="/v4/contact" className="v4-link" label="Contact">{pages.footer.cta}</TLink></p>
              <p className="v4-foot__about">{pages.footer.about}</p>
              <nav aria-label="Services" className="v4-foot__nav">
                {services.map((s) => <TLink key={s.slug} href={`/v4/services/${s.slug}`} label={s.name}>{s.name}</TLink>)}
                <TLink href="/v4/process" label="Process">How we work</TLink>
                <a href={company.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              </nav>
              <address>{company.address.join(", ")}</address>
              <p className="v4-foot__legal">
                {pages.footer.legal} · <a href={`mailto:${company.email}`}>{company.email}</a> · <a href={company.phoneHref}>{company.phone}</a>
              </p>
            </div>
          </footer>

          <div className="v4-curtain" aria-hidden="true">
            <div className="v4-curtain__inner">
              <img src="/brand/illumia-mark.svg" alt="" width={48} height={48} />
              <p className="v4-curtain__word" />
              <i className="v4-curtain__line" />
            </div>
          </div>
        </div>
      </TransitionProvider>
    </SmoothScroll>
  );
}
