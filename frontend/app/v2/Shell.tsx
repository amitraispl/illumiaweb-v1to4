"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { clearEnter, signalEnter } from "@/components/motion/onEnter";
import { TLink, TransitionProvider, type TransitionHooks } from "@/components/motion/Transition";
import { Clock } from "@/components/motion/Clock";
import { gsap, SplitText, useGSAP, ease, finePointer, reducedMotion } from "@/lib/gsap";
import { company, navFor, pages, services } from "@/lib/copy";

/* the masthead is the way home, so the nav lists the other three */
const nav = navFor("v2").slice(1);

export function Shell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  /* two shutters, ink then crimson, carrying the next page's name in italic */
  const hooks = useMemo<TransitionHooks>(
    () => ({
      cover: (_href, label) =>
        new Promise<void>((resolve) => {
          clearEnter("v2");
          const el = root.current;
          if (!el) return resolve();
          const word = el.querySelector<HTMLElement>(".v2-shutter__word")!;
          word.textContent = label || "Illumia";
          gsap
            .timeline({ onComplete: resolve })
            .set(".v2-shutter", { visibility: "visible" })
            .fromTo(".v2-shutter__panel", { yPercent: 100 }, { yPercent: 0, duration: 0.75, stagger: 0.09, ease: ease.wipe })
            .fromTo(word, { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: ease.out }, "-=0.35");
        }),
      reveal: (first) =>
        new Promise<void>((resolve) => {
          const el = root.current;
          if (!el) return resolve();
          const enter = () => signalEnter("v2");
          if (first) {
            // nothing to uncover on first load; a zero-length timeline would not fire its callbacks
            gsap.set(".v2-shutter", { visibility: "hidden" });
            enter();
            return resolve();
          }
          gsap
            .timeline({ onComplete: resolve })
            .to(".v2-shutter__word", { yPercent: -110, duration: 0.45, ease: ease.exit })
            .to(".v2-shutter__panel", { yPercent: -100, duration: 0.75, stagger: -0.09, ease: ease.wipe }, "-=0.1")
            .set(".v2-shutter", { visibility: "hidden" })
            .add(enter, "-=0.55");
        }),
    }),
    [],
  );

  /* cursor: a dot that inverts what it passes, and carries a word over links that need one */
  useGSAP(
    () => {
      if (!finePointer()) return;
      const c = root.current!.querySelector<HTMLElement>(".v2-cursor")!;
      gsap.set(c, { xPercent: -50, yPercent: -50, autoAlpha: 1 });
      const x = gsap.quickTo(c, "x", { duration: 0.45, ease: "power3.out" });
      const y = gsap.quickTo(c, "y", { duration: 0.45, ease: "power3.out" });
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

  /* footer masthead letters lift as the reader arrives */
  useGSAP(
    () => {
      if (reducedMotion()) return;
      const split = SplitText.create(".v2-foot__mast", { type: "chars", mask: "chars", charsClass: "ch" });
      gsap.from(split.chars, {
        yPercent: 105, stagger: 0.035, duration: 1.2, ease: ease.out,
        scrollTrigger: { trigger: ".v2-foot", start: "top 65%" },
      });
    },
    { scope: root },
  );

  return (
    <SmoothScroll duration={1.3}>
      <TransitionProvider hooks={hooks}>
        <div ref={root} className="v2-root">
          <a className="v2-skip" href="#main">Skip to content</a>
          <header className="v2-nav">
            <TLink href="/v2" className="v2-nav__logo" label="Illumia">
              <img src="/brand/illumia-logo-dark.svg" alt="Illumia Solutions, home" width={140} height={38} />
            </TLink>
            <nav aria-label="Main" className="v2-nav__links">
              {nav.map((n) => (
                <TLink key={n.href} href={n.href} aria-current={pathname === n.href ? "page" : undefined}>
                  <span className="v2-roll" data-text={n.label}><span>{n.label}</span></span>
                </TLink>
              ))}
            </nav>
            <p className="v2-nav__time">Kolkata <Clock tz="Asia/Kolkata" /></p>
          </header>

          <main id="main">{children}</main>

          <footer className="v2-foot">
            <div className="v2-foot__top">
              <p className="v2-foot__lead">
                {pages.footer.ask} <TLink href="/v2/contact" className="v2-ul" label="Contact">{pages.footer.cta}</TLink>, write to{" "}
                <a href={`mailto:${company.email}`} className="v2-ul">{company.email}</a> or call{" "}
                <a href={company.phoneHref} className="v2-ul">{company.phone}</a>.
              </p>
              <ul role="list" className="v2-foot__links">
                {services.map((s) => (
                  <li key={s.slug}><TLink href={`/v2/services/${s.slug}`} label={s.name}>{s.name}</TLink></li>
                ))}
                <li><TLink href="/v2/process" label="Process">How we work</TLink></li>
                <li><a href={company.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
              </ul>
              <address>{company.address.map((l) => <span key={l}>{l}</span>)}</address>
            </div>
            <p className="v2-foot__mast" aria-label="Illumia">Illumia</p>
            <div className="v2-foot__base">
              <em>{company.tagline}</em>
              <span>{pages.footer.legal}</span>
            </div>
          </footer>

          <div className="v2-cursor" aria-hidden="true"><span /></div>
          <div className="v2-shutter" aria-hidden="true">
            <div className="v2-shutter__panel" />
            <div className="v2-shutter__panel">
              <p className="v2-shutter__mask"><span className="v2-shutter__word" /></p>
            </div>
          </div>
        </div>
      </TransitionProvider>
    </SmoothScroll>
  );
}
