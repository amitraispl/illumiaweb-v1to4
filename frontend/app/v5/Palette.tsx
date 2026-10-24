"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useTransition } from "@/components/motion/Transition";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import { company, services } from "./content";
import { SHAPES, morph, shock, state } from "./field";

type Item = { id: string; group: string; label: string; hint?: string; run: () => void };

/* ⌘K / Ctrl+K: everything on the site, and a few things that only exist here. */
export function Palette({ open, onClose, onMotion, onTheme }: { open: boolean; onClose: () => void; onMotion: () => void; onTheme: () => void }) {
  const { navigate } = useTransition();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const back = useRef<HTMLElement | null>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [note, setNote] = useState("");
  const list = useId();

  const items = useMemo<Item[]>(() => {
    const go = (href: string, label: string) => () => navigate(href, label);
    return [
      { id: "home", group: "Pages", label: "Home", hint: "/v5", run: go("/v5", "Home") },
      { id: "services", group: "Pages", label: "Services", hint: "/v5/services", run: go("/v5/services", "Services") },
      { id: "process", group: "Pages", label: "How we work", hint: "/v5/process", run: go("/v5/process", "Process") },
      { id: "contact", group: "Pages", label: "Consult an expert", hint: "/v5/contact", run: go("/v5/contact", "Contact") },
      ...services.map((s) => ({ id: `svc-${s.slug}`, group: "Services", label: s.name, hint: s.promise, run: go(`/v5/services/${s.slug}`, s.name) })),
      ...SHAPES.map((s) => ({ id: `shape-${s}`, group: "Light", label: `Rebuild the light as ${s}`, hint: `morph ${s}`, run: () => morph(s, { dim: 0.9 }) })),
      { id: "ignite", group: "Light", label: "Ignite", hint: "send a shockwave", run: () => shock(window.innerWidth / 2, window.innerHeight / 2) },
      { id: "theme", group: "Settings", label: state.light ? "Switch to dark theme" : "Switch to light theme", hint: "glow or ink", run: onTheme },
      { id: "motion", group: "Settings", label: state.paused ? "Resume motion" : "Pause motion", hint: "freeze the light field", run: onMotion },
      {
        id: "copy", group: "Contact", label: "Copy phone number", hint: company.phone,
        run: () => { navigator.clipboard?.writeText(company.phone); setNote("Copied " + company.phone); },
      },
      { id: "call", group: "Contact", label: "Call Kolkata HQ", hint: company.phone, run: () => (window.location.href = company.phoneHref) },
      { id: "mail", group: "Contact", label: "Email sales", hint: company.email, run: () => (window.location.href = `mailto:${company.email}`) },
      { id: "linkedin", group: "Contact", label: "Open LinkedIn", hint: "new tab", run: () => window.open(company.linkedin, "_blank", "noopener") },
      { id: "main", group: "Elsewhere", label: "Illumia Solutions main site", hint: "illumiasolutions.com", run: () => window.open(company.site, "_blank", "noopener") },
      { id: "picker", group: "Elsewhere", label: "See every version", hint: "/", run: go("/", "Versions") },
    ];
    // labels that depend on state.paused and state.light are rebuilt whenever the palette opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, onMotion, onTheme, open]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((i) => `${i.group} ${i.label} ${i.hint ?? ""}`.toLowerCase().includes(t));
  }, [items, q]);

  useEffect(() => {
    if (!open) return;
    back.current = document.activeElement as HTMLElement;
    // reset the query each time the palette opens
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQ("");
    setActive(0);
    setNote("");
    requestAnimationFrame(() => input.current?.focus());
    return () => back.current?.focus?.();
  }, [open]);

  useGSAP(
    () => {
      if (!open || reducedMotion()) return;
      gsap.timeline()
        .fromTo(".v5-pal__scrim", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
        .fromTo(".v5-pal__box", { y: 30, scale: 0.96, autoAlpha: 0, rotateX: 12 }, { y: 0, scale: 1, autoAlpha: 1, rotateX: 0, duration: 0.6, ease: "expo.out" }, 0)
        .from(".v5-pal__opt", { x: -12, autoAlpha: 0, stagger: 0.015, duration: 0.4, ease: "expo.out" }, 0.1);
    },
    { scope: root, dependencies: [open], revertOnUpdate: true },
  );

  const run = (i: Item | undefined) => {
    if (!i) return;
    i.run();
    if (i.id !== "copy") onClose();
  };

  const key = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % Math.max(shown.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + shown.length) % Math.max(shown.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(shown[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  useEffect(() => {
    root.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;
  let group = "";

  return (
    <div ref={root} className="v5-pal" role="dialog" aria-modal="true" aria-label="Command palette" data-lenis-prevent>
      <div className="v5-pal__scrim" onClick={onClose} />
      <div className="v5-pal__box">
        <div className="v5-pal__bar">
          <span aria-hidden="true">›</span>
          <input
            ref={input}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={key}
            placeholder="Go anywhere, or rebuild the light as a phone…"
            role="combobox"
            aria-expanded="true"
            aria-controls={list}
            aria-activedescendant={shown[active] ? `${list}-${shown[active].id}` : undefined}
            aria-label="Search commands"
          />
          <kbd>esc</kbd>
        </div>
        <ul id={list} className="v5-pal__list" role="listbox" aria-label="Commands">
          {shown.map((i, n) => {
            const head = i.group !== group ? (group = i.group) : null;
            return (
              <li key={i.id} role="presentation">
                {head && <p className="v5-pal__group" aria-hidden="true">{head}</p>}
                <div
                  id={`${list}-${i.id}`}
                  role="option"
                  aria-selected={n === active}
                  data-i={n}
                  className="v5-pal__opt"
                  onPointerMove={() => setActive(n)}
                  onClick={() => run(i)}
                >
                  <span>{i.label}</span>
                  {i.hint && <small>{i.hint}</small>}
                </div>
              </li>
            );
          })}
          {shown.length === 0 && <li className="v5-pal__empty">Nothing matches &ldquo;{q}&rdquo;. Try &ldquo;mobile&rdquo; or &ldquo;network&rdquo;.</li>}
        </ul>
        <p className="v5-pal__foot" role="status">
          {note || <><kbd>↑</kbd><kbd>↓</kbd> to move · <kbd>enter</kbd> to run</>}
        </p>
      </div>
    </div>
  );
}
