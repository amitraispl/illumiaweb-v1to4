"use client";

/*
 * The fluid's control surface. The simulation (Fluid.tsx) drains `queue` every
 * frame and reads the rest; pages, physics bodies, the pipeline and the shell
 * write to it.
 */

import { ScrollTrigger, reducedMotion } from "@/lib/gsap";

/** How the ambient currents behave while a section is on screen. */
export const MODES = ["calm", "storm", "vortex", "rain", "jets", "still"] as const;
export type Mode = (typeof MODES)[number];

export type Splat = { x: number; y: number; dx: number; dy: number; color: [number, number, number]; radius: number };

/* brand crimsons as dye; values are light added to charcoal */
export const INK = {
  crimson: [0.71, 0.12, 0.24] as [number, number, number],
  hot: [0.9, 0.42, 0.51] as [number, number, number],
  deep: [0.56, 0.09, 0.18] as [number, number, number],
  white: [0.75, 0.72, 0.76] as [number, number, number],
};

export const flux = {
  queue: [] as Splat[],
  mode: "calm" as Mode,
  /** 0…1, scales ambient emitters */
  energy: 0.6,
  paused: false,
  overdrive: false,
  /** light theme: the display prints ink on paper instead of glowing on charcoal */
  light: true,
  /** ink floods from a point while set (page transitions) */
  flood: null as null | { x: number; y: number; t: number },
  /** dye clears fast until this time (ms, performance.now) */
  drainUntil: 0,
  /** stats for the HUD */
  fps: 60,
  sim: 0,
  dye: 0,
  ok: true,
};

let n = 0;
/** Cycle through the palette, with a rare white-hot splash. */
export function nextInk(scale = 1): [number, number, number] {
  n++;
  const c = n % 11 === 0 ? INK.white : n % 3 === 0 ? INK.hot : n % 3 === 1 ? INK.crimson : INK.deep;
  return [c[0] * scale, c[1] * scale, c[2] * scale];
}

/** Push ink at a screen point. dx/dy are in pixels per frame of pointer-like motion. */
export function splat(clientX: number, clientY: number, dx: number, dy: number, color = nextInk(), radius = 0.25) {
  if (reducedMotion()) return;
  flux.queue.push({
    x: clientX / window.innerWidth,
    y: 1 - clientY / window.innerHeight,
    dx: dx * 10,
    dy: -dy * 10,
    color,
    radius,
  });
}

/** A ring of splats thrown outward from a point. */
export function burst(clientX: number, clientY: number, count = 14, power = 30, scale = 1) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    const p = power * (0.6 + Math.random() * 0.8);
    splat(clientX, clientY, Math.cos(a) * p, Math.sin(a) * p, nextInk(scale), 0.18 + Math.random() * 0.2);
  }
}

export function setMode(mode: Mode, energy = 0.6) {
  flux.mode = mode;
  flux.energy = energy;
}

export function floodFrom(clientX: number, clientY: number) {
  if (reducedMotion()) return;
  flux.flood = { x: clientX / window.innerWidth, y: 1 - clientY / window.innerHeight, t: performance.now() };
}

export function drain(ms = 1400) {
  flux.flood = null;
  flux.drainUntil = performance.now() + ms;
}

/** While `trigger` holds the middle of the viewport, the currents take this mode. */
export function zone(trigger: Element | string, mode: Mode, energy = 0.6) {
  return ScrollTrigger.create({
    trigger,
    start: "top 55%",
    end: "bottom 45%",
    refreshPriority: -1,
    onToggle: (st) => st.isActive && setMode(mode, energy),
  });
}
