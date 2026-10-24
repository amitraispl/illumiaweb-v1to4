"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { reducedMotion } from "@/lib/gsap";
import { splat } from "./flux";
import { blip } from "./sound";

export type Tile = { key: string; kicker: string; title: string; lines: string[]; art?: ReactNode };

/* the grid must be wider and taller than the board so the wrap never shows a gap */
const COLS = 6;

/*
 * An endless board: drag it in any direction and it keeps going, wrapping
 * around. Tiles lean and squash with the speed of the throw, and the board
 * drifts on its own when left alone. Arrow keys pan it too.
 */
export function Board({ items, onOpen, height = "78vh", ratio = 0.86, label = "Board" }: {
  items: Tile[];
  onOpen: (t: Tile) => void;
  height?: string;
  /** tile height as a share of its width */
  ratio?: number;
  label?: string;
}) {
  const ROWS = Math.max(3, Math.ceil(items.length / COLS));
  /* offset each row so repeats never sit side by side; only the first copy of each tile is in the tab order */
  const layout = Array.from({ length: COLS * ROWS }, (_, i) => (i + Math.floor(i / COLS) * 2) % items.length);
  const first = new Set(items.map((_, k) => layout.indexOf(k)));
  const root = useRef<HTMLDivElement>(null);
  const tiles = useRef<HTMLElement[]>([]);
  const dragged = useRef(0);

  useEffect(() => {
    const el = root.current!;
    const still = reducedMotion();
    let cw = 0;
    let ch = 0;
    const pos = { x: 0, y: 0, vx: 0, vy: 0 };
    let drag = false;
    let lx = 0;
    let ly = 0;
    let lt = 0;
    let idle = 0;
    let visible = false;
    let raf = 0;

    const measure = () => {
      const w = el.clientWidth;
      cw = Math.max(280, Math.min(w * 0.3, 460));
      ch = cw * ratio;
      tiles.current.forEach((t) => {
        t.style.width = `${cw - 28}px`;
        t.style.height = `${ch - 28}px`;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const wrap = (v: number, size: number) => ((v % size) + size) % size;
    const draw = () => {
      const tw = COLS * cw;
      const th = ROWS * ch;
      const skew = Math.max(-12, Math.min(12, pos.vx * 0.006));
      const squash = 1 - Math.min(0.12, Math.hypot(pos.vx, pos.vy) * 0.00006);
      tiles.current.forEach((t, i) => {
        const c = i % COLS;
        const r = Math.floor(i / COLS);
        const x = wrap(c * cw + pos.x + cw, tw) - cw;
        const y = wrap(r * ch + pos.y + ch, th) - ch;
        t.style.transform = `translate3d(${x + 14}px, ${y + 14}px, 0) skewX(${-skew}deg) scale(${squash})`;
      });
    };

    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      if (!visible) return;
      if (!drag) {
        pos.x += pos.vx * dt;
        pos.y += pos.vy * dt;
        pos.vx *= Math.pow(0.04, dt);
        pos.vy *= Math.pow(0.04, dt);
        idle += dt;
        // drift on its own after a moment of stillness
        if (idle > 1.2 && !still) pos.x -= 22 * dt;
      }
      draw();
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = true;
      dragged.current = 0;
      lx = e.clientX;
      ly = e.clientY;
      lt = performance.now();
      pos.vx = pos.vy = 0;
      el.classList.add("is-drag");
      // listen on the window rather than capturing, so a click still reaches the tile under it
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const now = performance.now();
      const dt = Math.max((now - lt) / 1000, 0.008);
      const dx = e.clientX - lx;
      // touch keeps vertical page scrolling; only mice and pens pan vertically
      const dy = e.pointerType === "touch" ? 0 : e.clientY - ly;
      pos.x += dx;
      pos.y += dy;
      pos.vx = pos.vx * 0.4 + (dx / dt) * 0.6;
      pos.vy = pos.vy * 0.4 + (dy / dt) * 0.6;
      dragged.current += Math.abs(dx) + Math.abs(dy);
      lx = e.clientX;
      ly = e.clientY;
      lt = now;
      idle = 0;
      splat(e.clientX, e.clientY, dx * 0.5, dy * 0.5, undefined, 0.15);
    };
    const up = () => {
      drag = false;
      el.classList.remove("is-drag");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    const key = (e: KeyboardEvent) => {
      const k: Record<string, [number, number]> = { ArrowLeft: [600, 0], ArrowRight: [-600, 0], ArrowUp: [0, 600], ArrowDown: [0, -600] };
      if (!k[e.key] || e.target !== el) return;
      e.preventDefault();
      pos.vx += k[e.key][0] * 1.6;
      pos.vy += k[e.key][1] * 1.6;
      idle = 0;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("keydown", key);
      up();
    };
  }, [ROWS, ratio]);

  return (
    <div
      ref={root}
      className="v6-board"
      style={{ height }}
      tabIndex={0}
      role="region"
      aria-label={`${label}. Drag or use the arrow keys to pan.`}
      data-cursor="drag"
    >
      {layout.map((k, i) => {
        const t = items[k];
        const lead = first.has(i);
        return (
          <button
            key={i}
            type="button"
            ref={(n) => { if (n) tiles.current[i] = n; }}
            className="v6-tile"
            tabIndex={lead ? 0 : -1}
            aria-hidden={lead ? undefined : true}
            onPointerEnter={() => blip(i)}
            onClick={() => {
              if (dragged.current > 8) return; // a drag, not a click
              onOpen(t);
            }}
          >
            {t.art ? (
              <span className="v6-tile__cover">{t.art}</span>
            ) : (
              <span className="v6-tile__body">
                <small>{t.kicker}</small>
                <b>{t.title}</b>
                <span className="v6-tile__lines">{t.lines.map((l) => <span key={l}>{l}</span>)}</span>
              </span>
            )}
            <span className="v6-tile__meta">
              <b>{t.art ? t.title : ""}</b>
              <small>{t.art ? t.kicker : "Open →"}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}
