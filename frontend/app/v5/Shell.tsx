"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { clearEnter, signalEnter } from "@/components/motion/onEnter";
import { TLink, TransitionProvider, type TransitionHooks } from "@/components/motion/Transition";
import { Clock } from "@/components/motion/Clock";
import { gsap, useGSAP, ease, finePointer, reducedMotion } from "@/lib/gsap";
import { company, services } from "./content";
import { LightField } from "./LightField";
import { Footer } from "./Footer";
import { Palette } from "./Palette";
import { chromes } from "@/components/theme/script";
import { hold, morph, scatter, shock, state } from "./field";

const nav = [
  { href: "/v5", label: "Home" },
  { href: "/v5/services", label: "Services" },
  { href: "/v5/process", label: "Process" },
  { href: "/v5/contact", label: "Contact" },
];

export type Theme = "dark" | "light";

/** Set the theme on <html>, where the pre-paint script in the layout also puts it. */
export function applyTheme(t: Theme) {
  document.documentElement.dataset.v5Theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", chromes.v5[t]);
  state.light = t === "light";
  try {
    localStorage.setItem("v5-theme", t);
  } catch {}
}

const GLYPHS = "01<>/{}[]#=+*";

export function Shell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [palette, setPalette] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mod, setMod] = useState("Ctrl");
  const [grid, setGrid] = useState({ cols: 14, rows: 9 });
  const [theme, setTheme] = useState<Theme>("light");
  const lastDown = useRef({ x: 0, y: 0 });

  /* the mosaic is sized to the screen so its tiles stay square */
  useEffect(() => {
    const size = () => {
      const cols = window.innerWidth < 700 ? 6 : 14;
      setGrid({ cols, rows: Math.ceil((cols * window.innerHeight) / window.innerWidth) + 1 });
    };
    // read the browser once mounted, so the server render and hydration agree
    const id = requestAnimationFrame(() => {
      size();
      if (/Mac|iPhone|iPad/.test(navigator.platform)) setMod("⌘");
      const t: Theme = document.documentElement.dataset.v5Theme === "dark" ? "dark" : "light";
      state.light = t === "light";
      setTheme(t);
      try {
        if (localStorage.getItem("v5-paused") === "1") {
          state.paused = true;
          setPaused(true);
        }
      } catch {}
    });
    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", size);
    };
  }, []);

  const toggleMotion = useCallback(() => {
    state.paused = !state.paused;
    setPaused(state.paused);
    try {
      localStorage.setItem("v5-paused", state.paused ? "1" : "0");
    } catch {}
  }, []);

  /* the new theme spreads out of the switch in a circle; the light scatters and settles in its new ink */
  const toggleTheme = useCallback((e?: MouseEvent<HTMLElement>) => {
    const next: Theme = state.light ? "dark" : "light";
    const swap = () => {
      flushSync(() => setTheme(next));
      applyTheme(next);
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || reducedMotion()) return swap();
    const b = e?.currentTarget.getBoundingClientRect();
    const x = b ? b.left + b.width / 2 : window.innerWidth - 60;
    const y = b ? b.top + b.height / 2 : 40;
    const rad = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const html = document.documentElement;
    html.classList.add("v5-vt");
    const vt = doc.startViewTransition(swap);
    scatter(0.35, 1.4);
    vt.ready
      .then(() =>
        html.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
          { duration: 750, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
        ).finished,
      )
      .catch(() => {})
      .finally(() => html.classList.remove("v5-vt"));
  }, []);

  /* the page breaks into tiles that flip in from where you clicked, then fly apart from the centre */
  const hooks = useMemo<TransitionHooks>(() => {
    const q = (s: string) => root.current?.querySelector<HTMLElement>(s);
    const tiles = () => gsap.utils.toArray<HTMLElement>(".v5-mosaic i", root.current);
    const origin = () => {
      const g = q(".v5-mosaic");
      if (!g) return 0;
      const cols = Number(g.dataset.cols);
      const rows = Number(g.dataset.rows);
      const c = Math.min(cols - 1, Math.floor((lastDown.current.x / window.innerWidth) * cols));
      const r = Math.min(rows - 1, Math.floor((lastDown.current.y / window.innerHeight) * rows));
      return r * cols + c;
    };
    return {
      cover: (_href, label) =>
        new Promise<void>((resolve) => {
          clearEnter("v5");
          const g = q(".v5-mosaic");
          const word = q(".v5-mosaic__word");
          if (!g || !word) return resolve();
          const text = label || "Lumen";
          scatter(1.4, 1.8);
          gsap
            .timeline({ onComplete: resolve })
            .set(g, { visibility: "visible" })
            .fromTo(tiles(), { scale: 0, rotate: -90, borderRadius: "50%" }, {
              scale: 1.04, rotate: 0, borderRadius: "0%", duration: 0.55, ease: "power3.out",
              stagger: { grid: [Number(g.dataset.rows), Number(g.dataset.cols)], from: origin(), amount: 0.5 },
            })
            .fromTo(word, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.3 }, "-=0.35")
            .to(word, { duration: 0.6, scrambleText: { text, chars: GLYPHS, speed: 0.7 } }, "<");
        }),
      reveal: (first) =>
        new Promise<void>((resolve) => {
          const g = q(".v5-mosaic");
          if (!g) return resolve();
          if (first) {
            gsap.set(g, { visibility: "hidden" });
            if (sessionStorage.getItem("v5-loaded") || !q(".v5-boot") || navigator.webdriver) {
              document.documentElement.removeAttribute("data-v5-boot");
              signalEnter("v5");
              return resolve();
            }
            sessionStorage.setItem("v5-loaded", "1");
            boot(resolve);
            return;
          }
          gsap
            .timeline({ onComplete: resolve })
            .to(".v5-mosaic__word", { autoAlpha: 0, y: -20, duration: 0.3 })
            .to(tiles(), {
              scale: 0, rotate: 90, duration: 0.5, ease: "power3.in",
              stagger: { grid: [Number(g.dataset.rows), Number(g.dataset.cols)], from: "center", amount: 0.45 },
            }, 0.1)
            .add(() => signalEnter("v5"), 0.45)
            .set(g, { visibility: "hidden" })
            .set(".v5-mosaic__word", { y: 0 });
        }),
    };

    /* first visit: the field boots, scattered light condenses into the mark, then the page arrives */
    function boot(resolve: () => void) {
      const el = q(".v5-boot");
      if (!el) return resolve();
      hold(true);
      const n = { v: 0 };
      const num = el.querySelector<HTMLElement>(".v5-boot__n")!;
      const lines = gsap.utils.toArray<HTMLElement>(".v5-boot__log li", el);
      lines.forEach((li) => (li.textContent = ""));
      const page = [".v5-nav", "#main", ".v5-foot", ".v5-hud"];
      gsap.set(page, { autoAlpha: 0 });
      gsap.set(el, { autoAlpha: 1 });
      // GSAP owns the hidden state from here; drop the pre-paint guard
      document.documentElement.removeAttribute("data-v5-boot");
      const tl = gsap.timeline({ onComplete: resolve });
      tl.to(n, { v: 100, duration: 2.4, ease: "power2.inOut", onUpdate: () => (num.textContent = String(Math.round(n.v)).padStart(3, "0")) }, 0);
      lines.forEach((li, i) => {
        const text = (li.dataset.text ?? "").replace("{n}", state.count.toLocaleString("en-US"));
        tl.to(li, { duration: 0.28, text: { value: text }, ease: "none" }, 0.15 + i * 0.3);
      });
      tl.add(() => morph("mark", { scale: 1.25, dim: 1 }, 1.6, true), 1.5)
        .to(el, { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" }, 2.8)
        .add(() => hold(false), 3.0)
        .to(page, { autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: "power2.out" }, 3.0)
        .add(() => signalEnter("v5"), 3.0);
    }
  }, []);

  /* cursor ring, click shockwaves, HUD readout, Ctrl/⌘+K */
  useGSAP(
    () => {
      const el = root.current!;
      const hud = el.querySelector<HTMLElement>(".v5-hud__live")!;
      const ring = el.querySelector<HTMLElement>(".v5-cursor")!;
      const label = ring.querySelector("span")!;
      let px = 0;
      let py = 0;

      const down = (e: PointerEvent) => {
        lastDown.current = { x: e.clientX, y: e.clientY };
        const t = e.target as HTMLElement;
        if (!t.closest("a, button, input, textarea, select, label, [role=dialog], .v5-term")) shock(e.clientX, e.clientY);
      };
      window.addEventListener("pointerdown", down);

      const keys = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          setPalette((p) => !p);
        }
      };
      window.addEventListener("keydown", keys);
      const themed = () => toggleTheme();
      window.addEventListener("v5:theme", themed);

      let fine = false;
      let x: ((v: number) => void) | null = null;
      let y: ((v: number) => void) | null = null;
      if (finePointer() && !reducedMotion()) {
        fine = true;
        gsap.set(ring, { xPercent: -50, yPercent: -50, autoAlpha: 1 });
        x = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
        y = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
      }
      const move = (e: PointerEvent) => {
        px = e.clientX;
        py = e.clientY;
        if (!fine) return;
        x!(px);
        y!(py);
        const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, input, textarea, select, label");
        const kind = t?.dataset.cursor ?? (t ? "link" : "");
        ring.dataset.state = kind;
        label.textContent = kind === "view" ? "View" : kind === "drag" ? "Drag" : kind === "type" ? "Type" : "";
      };
      window.addEventListener("pointermove", move);

      const tick = () => {
        const nx = ((px / window.innerWidth) * 2 - 1).toFixed(3);
        const ny = (1 - (py / window.innerHeight) * 2).toFixed(3);
        hud.textContent = `${state.count.toLocaleString("en-US")} pts · ${Math.round(state.fps)} fps · ${state.shape} · x ${nx} y ${ny}`;
      };
      const id = window.setInterval(tick, 120);

      return () => {
        window.removeEventListener("pointerdown", down);
        window.removeEventListener("keydown", keys);
        window.removeEventListener("v5:theme", themed);
        window.removeEventListener("pointermove", move);
        window.clearInterval(id);
      };
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (!menu || reducedMotion()) return;
      gsap
        .timeline()
        .fromTo(".v5-menu", { clipPath: "circle(0% at 100% 0%)" }, { clipPath: "circle(150% at 100% 0%)", duration: 0.9, ease: ease.wipe })
        .from(".v5-menu__link", { yPercent: 120, rotate: 6, duration: 0.9, stagger: 0.06, ease: ease.out }, "-=0.45");
    },
    { scope: root, dependencies: [menu], revertOnUpdate: true },
  );

  return (
    <SmoothScroll duration={1.2}>
      <TransitionProvider hooks={hooks}>
        <div ref={root} className="v5-root" data-paused={paused || undefined}>
          <LightField />
          <a className="v5-skip" href="#main">Skip to content</a>

          <header className="v5-nav">
            <TLink href="/v5" className="v5-nav__logo" label="Home">
              <img className="v5-logo v5-logo--on-dark" src="/brand/illumia-logo-light.svg" alt="Illumia Solutions, home" width={140} height={38} />
              <img className="v5-logo v5-logo--on-light" src="/brand/illumia-logo-dark.svg" alt="Illumia Solutions, home" width={140} height={38} />
            </TLink>
            <nav aria-label="Main" className="v5-nav__links">
              {nav.slice(1).map((n, i) => (
                <div key={n.href} className="v5-nav__item">
                  <TLink href={n.href} label={n.label} aria-current={pathname === n.href || (i === 0 && pathname.startsWith(n.href)) ? "page" : undefined}>
                    <small>0{i + 1}</small>
                    <span data-text={n.label}>{n.label}</span>
                  </TLink>
                  {i === 0 && (
                    <ul className="v5-drop" role="list">
                      {services.map((x, k) => (
                        <li key={x.slug}>
                          <TLink href={`/v5/services/${x.slug}`} label={x.name} aria-current={pathname.endsWith(`/${x.slug}`) ? "page" : undefined}>
                            <small>0{k + 1} · {x.tag}</small>
                            <b>{x.name}</b>
                            <span>{x.promise}</span>
                          </TLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </nav>
            <div className="v5-nav__tools">
              <button className="v5-nav__k" onClick={() => setPalette(true)} aria-haspopup="dialog">
                <kbd>{mod}</kbd><kbd>K</kbd><span className="sr-only">Open command palette</span>
              </button>
              <button className="v5-nav__theme" onClick={toggleTheme} aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"} data-theme-now={theme}>
                <i aria-hidden="true" />
                <span>{theme === "light" ? "Dark" : "Light"}</span>
              </button>
              <button className="v5-nav__motion" onClick={toggleMotion} aria-pressed={paused}>
                <i aria-hidden="true" />
                <span>{paused ? "Play motion" : "Pause motion"}</span>
              </button>
              <button className="v5-nav__menu" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="v5-menu">
                {menu ? "Close" : "Menu"}
              </button>
            </div>
          </header>

          <div id="v5-menu" className="v5-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden={!menu}>
            <nav aria-label="Menu">
              <ul role="list">
                {nav.map((n) => (
                  <li key={n.href} className="v5-menu__row">
                    <TLink href={n.href} className="v5-menu__link" label={n.label} onClick={() => setMenu(false)}>
                      {n.label}
                    </TLink>
                    {n.label === "Services" && (
                      <ul className="v5-menu__sub" role="list">
                        {services.map((x) => (
                          <li key={x.slug}>
                            <TLink href={`/v5/services/${x.slug}`} label={x.name} onClick={() => setMenu(false)}>{x.name}</TLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="v5-menu__meta">
              <p>Kolkata <Clock tz="Asia/Kolkata" /></p>
              <a href={company.phoneHref}>{company.phone}</a>
              <a href={`mailto:${company.email}`}>{company.email}</a>
              <button onClick={() => { setMenu(false); setPalette(true); }}>Command palette</button>
            </div>
          </div>

          <main id="main">{children}</main>
          <Footer />

          <p className="v5-hud" aria-hidden="true">
            <b>LUMEN</b> <span className="v5-hud__live" />
          </p>

          <div className="v5-cursor" aria-hidden="true"><span /></div>

          <div className="v5-mosaic" aria-hidden="true" data-cols={grid.cols} data-rows={grid.rows} style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)` }}>
            {Array.from({ length: grid.cols * grid.rows }).map((_, i) => <i key={i} />)}
            <p className="v5-mosaic__word" />
          </div>

          <div className="v5-boot" aria-hidden="true">
            <p className="v5-boot__n">000</p>
            <ol className="v5-boot__log" role="list">
              {[
                "lumen v5 · illumia software development",
                "› webgl context ............ ok",
                "› {n} particles ......... lit",
                "› design · mobile · web · api  ok",
                "› 7-stage cycle ............ armed",
                "› assembling the mark",
              ].map((t) => <li key={t} data-text={t}>{t}</li>)}
            </ol>
          </div>

          <Palette open={palette} onClose={() => setPalette(false)} onMotion={toggleMotion} onTheme={toggleTheme} />
        </div>
      </TransitionProvider>
    </SmoothScroll>
  );
}
