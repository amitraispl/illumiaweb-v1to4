"use client";

import { useEffect, useRef, useState } from "react";
import { useTransition } from "@/components/motion/Transition";
import { reducedMotion } from "@/lib/gsap";
import { services, stack } from "@/lib/copy";
import { burst, splat } from "./flux";
import { blip, thud } from "./sound";

type Body = { x: number; y: number; vx: number; vy: number; r: number; a: number; drag: boolean; moved: number; px: number; py: number; t: number };

const CHIPS = stack.slice(0, 14);

/*
 * The six practices as physical bodies: they fall into the box when it comes
 * into view, and you can grab, stack and throw them. Hard collisions splash
 * ink into the fluid behind. Without script, or with reduced motion, they sit
 * in a plain wrapped layout and are ordinary links.
 */
export function Physics() {
  const { navigate } = useTransition();
  const box = useRef<HTMLDivElement>(null);
  const els = useRef<HTMLElement[]>([]);
  const bodies = useRef<Body[]>([]);
  const gravity = useRef(2200);
  const [zeroG, setZeroG] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = box.current!;
    if (reducedMotion()) return;
    const items = els.current;
    let W = 0;
    let H = 0;
    let started = false;
    let visible = false;
    let raf = 0;
    let last = performance.now();

    const radius = () => Math.max(52, Math.min(W * 0.064, 104));
    const measure = () => {
      W = el.clientWidth;
      H = el.clientHeight;
      const big = radius();
      items.forEach((it, i) => {
        const r = i < services.length ? big : big * 0.42;
        const b = bodies.current[i];
        if (b) b.r = r;
        it.style.width = it.style.height = `${r * 2}px`;
      });
    };

    const start = () => {
      started = true;
      // switch the box to its live size now, so the floor is measured where it will be
      el.classList.add("is-live");
      setLive(true);
      measure();
      bodies.current = items.map((_, i) => {
        const r = i < services.length ? radius() : radius() * 0.42;
        return { x: r + Math.random() * (W - r * 2), y: -r - i * 70 - Math.random() * 60, vx: (Math.random() - 0.5) * 200, vy: 0, r, a: 0, drag: false, moved: 0, px: 0, py: 0, t: 0 };
      });
    };

    const rect = () => el.getBoundingClientRect();
    const step = (dt: number) => {
      const bs = bodies.current;
      const g = gravity.current;
      for (const b of bs) {
        if (b.drag) continue;
        b.vy += g * dt;
        if (g === 0) {
          b.vx *= 0.995;
          b.vy *= 0.995;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.a += (b.vx * dt) / b.r;
        if (b.y > H - b.r) {
          const hit = b.vy;
          b.y = H - b.r;
          b.vy = -b.vy * 0.42;
          b.vx *= 0.97;
          if (hit > 700) thud(hit / 3000);
        }
        if (g === 0 && b.y < b.r && b.vy < 0) {
          b.y = b.r;
          b.vy = -b.vy * 0.6;
        }
        if (b.x < b.r) {
          b.x = b.r;
          b.vx = Math.abs(b.vx) * 0.55;
        } else if (b.x > W - b.r) {
          b.x = W - b.r;
          b.vx = -Math.abs(b.vx) * 0.55;
        }
      }
      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const p = bs[i];
          const q = bs[j];
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const min = p.r + q.r;
          const d2 = dx * dx + dy * dy;
          if (d2 >= min * min || d2 === 0) continue;
          const d = Math.sqrt(d2);
          const nx = dx / d;
          const ny = dy / d;
          const ip = p.drag ? 0 : 1 / (p.r * p.r);
          const iq = q.drag ? 0 : 1 / (q.r * q.r);
          const sum = ip + iq || 1;
          const over = min - d;
          p.x -= nx * over * (ip / sum);
          p.y -= ny * over * (ip / sum);
          q.x += nx * over * (iq / sum);
          q.y += ny * over * (iq / sum);
          const vn = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
          if (vn >= 0) continue;
          const imp = (-(1 + 0.35) * vn) / sum;
          p.vx -= imp * ip * nx;
          p.vy -= imp * ip * ny;
          q.vx += imp * iq * nx;
          q.vy += imp * iq * ny;
          if (-vn > 650) {
            const r = rect();
            splat(r.left + p.x + nx * p.r, r.top + p.y + ny * p.r, nx * -vn * 0.012, ny * -vn * 0.012, undefined, 0.12);
            thud(-vn / 4000);
          }
        }
      }
    };

    const draw = () => {
      bodies.current.forEach((b, i) => {
        const turn = i < services.length ? Math.max(-0.4, Math.min(0.4, Math.sin(b.a) * 0.4)) : b.a;
        items[i].style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0) rotate(${turn}rad)`;
      });
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      if (!visible || !started) return;
      for (let s = 0; s < 3; s++) step(dt / 3);
      draw();
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !started && e.intersectionRatio > 0.3) start();
    }, { threshold: [0, 0.3] });
    io.observe(el);
    const ro = new ResizeObserver(() => started && measure());
    ro.observe(el);

    /* grab and throw */
    const offs = items.map((it, i) => {
      const down = (e: PointerEvent) => {
        const b = bodies.current[i];
        if (!b) return;
        it.setPointerCapture(e.pointerId);
        b.drag = true;
        b.moved = 0;
        b.px = e.clientX;
        b.py = e.clientY;
        b.t = performance.now();
        b.vx = b.vy = 0;
      };
      const move = (e: PointerEvent) => {
        const b = bodies.current[i];
        if (!b?.drag) return;
        const now = performance.now();
        const dt = Math.max((now - b.t) / 1000, 0.008);
        const dx = e.clientX - b.px;
        const dy = e.clientY - b.py;
        b.moved += Math.abs(dx) + Math.abs(dy);
        b.x = Math.max(b.r, Math.min(W - b.r, b.x + dx));
        b.y = Math.min(H - b.r, b.y + dy);
        b.vx = b.vx * 0.5 + (dx / dt) * 0.5;
        b.vy = b.vy * 0.5 + (dy / dt) * 0.5;
        b.px = e.clientX;
        b.py = e.clientY;
        b.t = now;
        if (Math.random() < 0.5) splat(e.clientX, e.clientY, dx * 0.6, dy * 0.6, undefined, 0.1);
      };
      const up = () => {
        const b = bodies.current[i];
        if (!b?.drag) return;
        b.drag = false;
        const speed = Math.hypot(b.vx, b.vy);
        if (speed > 900) {
          const r = rect();
          burst(r.left + b.x, r.top + b.y, 8, speed / 80, 0.6);
        }
      };
      const enter = () => blip(i);
      it.addEventListener("pointerdown", down);
      it.addEventListener("pointermove", move);
      it.addEventListener("pointerup", up);
      it.addEventListener("pointercancel", up);
      it.addEventListener("pointerenter", enter);
      return () => {
        it.removeEventListener("pointerdown", down);
        it.removeEventListener("pointermove", move);
        it.removeEventListener("pointerup", up);
        it.removeEventListener("pointercancel", up);
        it.removeEventListener("pointerenter", enter);
      };
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      offs.forEach((f) => f());
    };
  }, []);

  const shake = () => {
    bodies.current.forEach((b) => {
      b.vx += (Math.random() - 0.5) * 1800;
      b.vy -= 900 + Math.random() * 1400;
    });
    const r = box.current!.getBoundingClientRect();
    burst(r.left + r.width / 2, r.bottom - 40, 16, 40, 0.7);
    thud(1);
  };

  const flip = () => {
    const next = !zeroG;
    setZeroG(next);
    gravity.current = next ? 0 : 2200;
    if (next) bodies.current.forEach((b) => ((b.vx += (Math.random() - 0.5) * 300), (b.vy -= 200 + Math.random() * 300)));
  };

  return (
    <div className="v6-play__wrap">
      <div ref={box} className={`v6-play${live ? " is-live" : ""}`}>
        {services.map((s, i) => (
          <button
            key={s.slug}
            type="button"
            ref={(n) => { if (n) els.current[i] = n; }}
            className="v6-body is-svc"
            data-cursor="drag"
            onClick={() => {
              const b = bodies.current[i];
              if (b && b.moved > 8) {
                b.moved = 0; // it was a throw, not a click
                return;
              }
              navigate(`/v6/services/${s.slug}`, s.name);
            }}
          >
            <span>{s.name}</span>
          </button>
        ))}
        {CHIPS.map((t, k) => (
          <span key={t} ref={(n) => { if (n) els.current[services.length + k] = n; }} className="v6-body is-chip" aria-hidden="true">
            {t}
          </span>
        ))}
      </div>
      {live && (
        <div className="v6-play__tools">
          <button type="button" onClick={shake}>Shake</button>
          <button type="button" onClick={flip} aria-pressed={zeroG}>Zero gravity</button>
          <span>Grab, stack and throw. Click a practice to read about it.</span>
        </div>
      )}
    </div>
  );
}
