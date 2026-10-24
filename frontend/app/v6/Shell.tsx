"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { clearEnter, signalEnter } from "@/components/motion/onEnter";
import { TLink, TransitionProvider, type TransitionHooks } from "@/components/motion/Transition";
import { Clock } from "@/components/motion/Clock";
import { gsap, ScrollTrigger, SplitText, useGSAP, ease, finePointer, reducedMotion } from "@/lib/gsap";
import { company, navFor } from "@/lib/copy";
import { Fluid } from "./Fluid";
import { Footer } from "./Footer";
import { burst, drain, floodFrom, flux } from "./flux";
import { liquid } from "./Liquid";
import { chromes } from "@/components/theme/script";
import { blip, intensity, setSound, whoosh } from "./sound";

const nav = navFor("v6");

export type Theme = "dark" | "light";

/** Put the theme on <html> (the layout's pre-paint script does the same) and tell the ink. */
function applyTheme(t: Theme) {
  document.documentElement.dataset.v6Theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", chromes.v6[t]);
  flux.light = t === "light";
  try {
    localStorage.setItem("v6-theme", t);
  } catch {}
}

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export function Shell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [sound, setSoundOn] = useState(false);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const lastDown = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      lastDown.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const t: Theme = document.documentElement.dataset.v6Theme === "dark" ? "dark" : "light";
      flux.light = t === "light";
      setTheme(t);
      try {
        if (localStorage.getItem("v6-paused") === "1") {
          flux.paused = liquid.paused = true;
          setPaused(true);
        }
      } catch {}
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const say = useCallback((t: string) => {
    setToast(t);
    window.setTimeout(() => setToast((x) => (x === t ? "" : x)), 2600);
  }, []);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSoundOn(next);
    if (next) blip(4);
  };

  /* the other theme pours out of the switch in a circle, and the ink changes from glow to print */
  const toggleTheme = (e: MouseEvent<HTMLElement>) => {
    const next: Theme = theme === "light" ? "dark" : "light";
    const swap = () => {
      flushSync(() => setTheme(next));
      applyTheme(next);
    };
    blip(next === "light" ? 5 : 0);
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || reducedMotion()) return swap();
    const b = e.currentTarget.getBoundingClientRect();
    const x = b.left + b.width / 2;
    const y = b.top + b.height / 2;
    const rad = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const html = document.documentElement;
    html.classList.add("v6-vt");
    doc.startViewTransition(swap).ready
      .then(() =>
        html.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
          { duration: 800, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
        ).finished,
      )
      .catch(() => {})
      .finally(() => {
        html.classList.remove("v6-vt");
        burst(x, y, 12, 30, 0.7);
      });
  };

  const toggleMotion = () => {
    const next = !paused;
    flux.paused = liquid.paused = next;
    setPaused(next);
    try {
      localStorage.setItem("v6-paused", next ? "1" : "0");
    } catch {}
  };

  /* ink floods out from where you clicked, a solid wave closes over it, then the ink drains */
  const hooks = useMemo<TransitionHooks>(() => {
    const q = (s: string) => root.current?.querySelector<HTMLElement>(s);
    return {
      cover: (_href, label) =>
        new Promise<void>((resolve) => {
          clearEnter("v6");
          const ink = q(".v6-ink");
          const word = q(".v6-ink__word");
          if (!ink || !word) return resolve();
          const { x, y } = lastDown.current;
          word.textContent = label || "Flux";
          const split = SplitText.create(word, { type: "chars" });
          floodFrom(x, y);
          whoosh(1.1);
          gsap
            .timeline({ onComplete: resolve })
            .set(ink, { visibility: "visible", clipPath: `circle(0% at ${x}px ${y}px)` })
            .to(ink, { clipPath: `circle(150% at ${x}px ${y}px)`, duration: 0.95, ease: "power3.in" }, 0.25)
            .from(split.chars, { yPercent: 120, rotate: 12, duration: 0.6, stagger: 0.03, ease: ease.out }, 0.85);
        }),
      reveal: (first) =>
        new Promise<void>((resolve) => {
          const ink = q(".v6-ink");
          if (!ink) return resolve();
          if (first) {
            gsap.set(ink, { visibility: "hidden" });
            if (sessionStorage.getItem("v6-loaded") || !q(".v6-drop") || navigator.webdriver) {
              document.documentElement.removeAttribute("data-v6-boot");
              signalEnter("v6");
              return resolve();
            }
            sessionStorage.setItem("v6-loaded", "1");
            drop(resolve);
            return;
          }
          drain(1600);
          gsap
            .timeline({ onComplete: resolve })
            .to(".v6-ink__word", { yPercent: -60, autoAlpha: 0, duration: 0.35, ease: "power2.in" })
            .to(ink, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: ease.wipe }, 0.15)
            .add(() => signalEnter("v6"), 0.45)
            .set(ink, { visibility: "hidden", clipPath: "none" })
            .set(".v6-ink__word", { yPercent: 0, autoAlpha: 1 });
        }),
    };

    /* first visit: one drop of ink falls and splashes the page into being */
    function drop(resolve: () => void) {
      const el = q(".v6-drop");
      const bead = q(".v6-drop__bead");
      if (!el || !bead) return resolve();
      const page = [".v6-nav", "#main", ".v6-foot", ".v6-hud"];
      gsap.set(page, { autoAlpha: 0 });
      gsap.set(el, { autoAlpha: 1 });
      document.documentElement.removeAttribute("data-v6-boot");
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      gsap
        .timeline({ onComplete: resolve })
        .fromTo(".v6-drop__word", { autoAlpha: 0, letterSpacing: "0.6em" }, { autoAlpha: 1, letterSpacing: "0.2em", duration: 1, ease: ease.out })
        .fromTo(bead, { y: -window.innerHeight * 0.6, scaleY: 1.6, scaleX: 0.7 }, { y: 0, scaleY: 1, scaleX: 1, duration: 0.8, ease: "power2.in" }, 0.3)
        .to(bead, { scaleX: 2.4, scaleY: 0.2, duration: 0.12, ease: "power2.out" })
        .add(() => {
          burst(cx, cy, 34, 90, 1.1);
          burst(cx, cy, 16, 40, 0.6);
        })
        .to(bead, { autoAlpha: 0, duration: 0.1 }, "<")
        .to(".v6-drop__word", { autoAlpha: 0, y: -20, duration: 0.5 }, "<0.1")
        .set(el, { autoAlpha: 0 })
        .to(page, { autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: "power2.out" }, "<0.4")
        .add(() => signalEnter("v6"), "<");
    }
  }, []);

  /* cursor, click splashes, the HUD, scroll → sound, and a secret */
  useGSAP(
    () => {
      const el = root.current!;
      const hud = el.querySelector<HTMLElement>(".v6-hud__live")!;
      const ring = el.querySelector<HTMLElement>(".v6-cursor")!;
      const label = ring.querySelector("span")!;

      const down = (e: PointerEvent) => {
        lastDown.current = { x: e.clientX, y: e.clientY };
        const t = e.target as HTMLElement;
        if (!t.closest("a, button, input, textarea, select, label, [role=dialog], .v6-board, .v6-play")) burst(e.clientX, e.clientY, 10, 26, 0.7);
      };
      window.addEventListener("pointerdown", down);

      let seq: string[] = [];
      const keys = (e: KeyboardEvent) => {
        seq = [...seq, e.key].slice(-KONAMI.length);
        if (seq.join() === KONAMI.join()) {
          flux.overdrive = !flux.overdrive;
          say(flux.overdrive ? "Overdrive. The ink has had too much coffee." : "Overdrive off.");
          burst(window.innerWidth / 2, window.innerHeight / 2, 40, 120, 1.2);
          seq = [];
        }
      };
      window.addEventListener("keydown", keys);

      let x: ((v: number) => void) | null = null;
      let y: ((v: number) => void) | null = null;
      if (finePointer() && !reducedMotion()) {
        gsap.set(ring, { xPercent: -50, yPercent: -50, autoAlpha: 1 });
        x = gsap.quickTo(ring, "x", { duration: 0.3, ease: "power3.out" });
        y = gsap.quickTo(ring, "y", { duration: 0.3, ease: "power3.out" });
      }
      const move = (e: PointerEvent) => {
        if (!x || !y) return;
        x(e.clientX);
        y(e.clientY);
        const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, input, textarea, select, label");
        const kind = t?.dataset.cursor ?? (t ? "link" : "");
        ring.dataset.state = kind;
        label.textContent = kind === "drag" ? "Drag" : kind === "view" ? "Open" : "";
      };
      window.addEventListener("pointermove", move);

      const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => intensity(Math.min(Math.abs(s.getVelocity()) / 4000, 1)) });

      const tick = window.setInterval(() => {
        hud.textContent = flux.ok
          ? `navier–stokes ${flux.sim}² · ink ${flux.dye}² · ${Math.round(flux.fps)} fps · ${flux.mode}${flux.overdrive ? " · overdrive" : ""}`
          : "webgl2 unavailable · still ink";
      }, 200);

      return () => {
        window.removeEventListener("pointerdown", down);
        window.removeEventListener("keydown", keys);
        window.removeEventListener("pointermove", move);
        window.clearInterval(tick);
        st.kill();
      };
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (!menu || reducedMotion()) return;
      const { x, y } = lastDown.current;
      gsap
        .timeline()
        .fromTo(".v6-menu", { clipPath: `circle(0% at ${x}px ${y}px)` }, { clipPath: `circle(150% at ${x}px ${y}px)`, duration: 0.9, ease: ease.wipe })
        .from(".v6-menu__link", { yPercent: 110, skewY: 8, duration: 0.9, stagger: 0.06, ease: ease.out }, "-=0.45");
    },
    { scope: root, dependencies: [menu], revertOnUpdate: true },
  );

  return (
    <SmoothScroll duration={1.1}>
      <TransitionProvider hooks={hooks}>
        <div ref={root} className="v6-root" data-paused={paused || undefined}>
          <Fluid />
          <a className="v6-skip" href="#main">Skip to content</a>

          <header className="v6-nav">
            <TLink href="/v6" className="v6-nav__logo" label="Flux">
              <img className="v6-logo v6-logo--on-dark" src="/brand/illumia-logo-light.svg" alt="Illumia Solutions, home" width={140} height={38} />
              <img className="v6-logo v6-logo--on-light" src="/brand/illumia-logo-dark.svg" alt="Illumia Solutions, home" width={140} height={38} />
            </TLink>
            <nav aria-label="Main" className="v6-nav__links">
              {nav.slice(1).map((n) => (
                <TLink key={n.href} href={n.href} label={n.label} aria-current={pathname === n.href ? "page" : undefined} onPointerEnter={() => blip()}>
                  {n.label}
                </TLink>
              ))}
            </nav>
            <div className="v6-nav__tools">
              <button className="v6-nav__sound" onClick={toggleSound} aria-pressed={sound}>
                <span className="v6-eq" aria-hidden="true"><i /><i /><i /><i /></span>
                <span>Sound</span>
              </button>
              <button className="v6-nav__theme" onClick={toggleTheme} aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"} data-theme-now={theme}>
                <i aria-hidden="true" />
                <span>{theme === "light" ? "Dark" : "Light"}</span>
              </button>
              <button className="v6-nav__motion" onClick={toggleMotion} aria-pressed={paused}>
                {paused ? "Play motion" : "Pause motion"}
              </button>
              <button className="v6-nav__menu" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="v6-menu">
                {menu ? "Close" : "Menu"}
              </button>
            </div>
          </header>

          <div id="v6-menu" className="v6-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden={!menu}>
            <nav aria-label="Menu">
              <ul role="list">
                {nav.map((n) => (
                  <li key={n.href} className="v6-menu__row">
                    <TLink href={n.href} className="v6-menu__link" label={n.label} onClick={() => setMenu(false)}>{n.label}</TLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="v6-menu__meta">
              <p>Kolkata <Clock tz="Asia/Kolkata" /></p>
              <a href={company.phoneHref}>{company.phone}</a>
            </div>
          </div>

          <main id="main">{children}</main>
          <Footer />

          <p className="v6-hud" aria-hidden="true"><b>FLUX</b> <span className="v6-hud__live" /></p>
          <p className="v6-toast" role="status">{toast}</p>
          <div className="v6-cursor" aria-hidden="true"><span /></div>

          <div className="v6-ink" aria-hidden="true">
            <p className="v6-ink__word" />
          </div>
          <div className="v6-drop" aria-hidden="true">
            <i className="v6-drop__bead" />
            <p className="v6-drop__word">FLUX</p>
          </div>
        </div>
      </TransitionProvider>
    </SmoothScroll>
  );
}
