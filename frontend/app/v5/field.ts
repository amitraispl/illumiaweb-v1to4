"use client";

/*
 * The light field's state. The canvas (Field.tsx) reads it every frame;
 * pages, the shell, the terminal and the command palette write to it.
 */

import { gsap, ScrollTrigger, reducedMotion } from "@/lib/gsap";

export const SHAPES = ["nebula", "mark", "code", "wireframe", "phone", "stack", "network", "cycle", "branches", "terrain", "knot", "globe", "words"] as const;
export type Shape = (typeof SHAPES)[number];

export type Pose = {
  /** where the shape sits, in viewport fractions from the centre (-1…1) */
  x?: number;
  y?: number;
  scale?: number;
  /** overall brightness, 0…1 */
  dim?: number;
  /** 0…1: blend toward the warp-speed starfield */
  warp?: number;
};

/** the shader has six slots; shapes are loaded into whichever slot is dark when they are asked for */
export const SLOTS = 6;

export const state = {
  /** weight of each slot */
  w: [1, 0, 0, 0, 0, 0],
  /** which shape each slot holds; the canvas uploads a slot whenever this changes */
  slots: ["nebula", "mark", "code", "cycle", "globe", "words"] as Shape[],
  x: 0,
  y: 0,
  scale: 1,
  dim: 1,
  warp: 0,
  chaos: 0.6,
  /** globe yaw/pitch in radians; spins on its own unless locked */
  yaw: 0,
  pitch: 0.25,
  globeLocked: false,
  /** scroll-driven forward motion for the warp field */
  flow: 0,
  speed: 0,
  shock: { x: 0, y: 0, t: 9 },
  paused: false,
  /** light theme: particles are drawn as ink on paper instead of glow on the dark */
  light: false,
  shape: "nebula" as Shape,
  /** while the first-visit sequence runs, page requests are queued, not applied */
  held: false,
  pending: null as null | { shape: Shape; pose: Pose },
  /** the latest request from a page, restored when the boot sequence lets go */
  last: null as null | { shape: Shape; pose: Pose },
  /** measured by the canvas, shown in the HUD */
  fps: 60,
  count: 0,
};

const weights = { w0: 1, w1: 0, w2: 0, w3: 0, w4: 0, w5: 0 };
type W = keyof typeof weights;
const flush = () => state.slots.forEach((_, i) => (state.w[i] = weights[`w${i}` as W]));

/** The slot holding a shape, loading it into the dimmest slot if it is not on the GPU yet. */
function slotFor(shape: Shape) {
  const have = state.slots.indexOf(shape);
  if (have >= 0) return have;
  let k = 0;
  for (let i = 1; i < SLOTS; i++) if (weights[`w${i}` as W] < weights[`w${k}` as W]) k = i;
  weights[`w${k}` as W] = 0;
  state.slots[k] = shape;
  return k;
}

/** Rebuild the light into another shape. Particles scatter on the way and settle on arrival. */
export function morph(shape: Shape, pose: Pose = {}, duration = 1.8, force = false) {
  if (!force) state.last = { shape, pose };
  if (state.held && !force) {
    state.pending = { shape, pose };
    return;
  }
  const i = slotFor(shape);
  const instant = reducedMotion();
  const target: Record<string, number> = {};
  for (let k = 0; k < SLOTS; k++) target[`w${k}`] = k === i ? 1 : 0;
  const p = { x: 0, y: 0, scale: 1, dim: 1, warp: 0, ...pose };
  const changed = state.shape !== shape;
  state.shape = shape;
  if (instant) {
    Object.assign(weights, target);
    flush();
    Object.assign(state, p);
    return;
  }
  gsap.to(weights, { ...target, duration, ease: "expo.inOut", overwrite: true, onUpdate: flush });
  gsap.to(state, { x: p.x, y: p.y, scale: p.scale, dim: p.dim, warp: p.warp, duration: duration * 0.9, ease: "power3.inOut", overwrite: "auto" });
  // a page that unmounts mid-morph kills these tweens with its GSAP context, so a repeat
  // request for the same shape must still settle the turbulence instead of doing nothing
  if (changed) scatter(0.55, duration);
  else gsap.to(state, { chaos: 0, duration: duration * 0.6, ease: "power3.out", overwrite: "auto" });
}

/** A burst of turbulence that decays. */
export function scatter(amount = 1, duration = 1.6) {
  if (reducedMotion()) return;
  gsap.timeline({ overwrite: false })
    .to(state, { chaos: amount, duration: duration * 0.3, ease: "power2.out" })
    .to(state, { chaos: 0, duration: duration * 0.9, ease: "power3.inOut" });
}

/** A ring of force from a screen point. */
export function shock(clientX: number, clientY: number) {
  if (reducedMotion()) return;
  state.shock.x = (clientX / window.innerWidth) * 2 - 1;
  state.shock.y = 1 - (clientY / window.innerHeight) * 2;
  state.shock.t = 0;
}

/** Hold the field (first-visit sequence) and release it, applying the latest page request. */
export function hold(on: boolean) {
  state.held = on;
  if (on) return;
  // pages can ask before the hold begins, so fall back to their last request
  const next = state.pending ?? state.last;
  state.pending = null;
  if (next) morph(next.shape, next.pose, 2.4);
}

/** Turn the globe to face a point on it. */
export function face(lat: number, lon: number) {
  state.globeLocked = true;
  const want = (-lon * Math.PI) / 180;
  // take the short way round
  const turns = Math.round((state.yaw - want) / (Math.PI * 2));
  gsap.to(state, { yaw: want + turns * Math.PI * 2, pitch: (lat * Math.PI) / 180, duration: 1.4, ease: "expo.out", overwrite: "auto" });
}

export function release() {
  state.globeLocked = false;
  gsap.to(state, { pitch: 0.25, duration: 1.2, ease: "power2.inOut" });
}

const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches;

/**
 * While `trigger` is in the middle of the viewport, the field takes this shape.
 * Desktop and mobile poses differ so the light never sits behind body copy on a phone.
 */
export function zone(trigger: Element | string, shape: Shape, desktop: Pose = {}, mobile: Pose = { ...desktop, x: 0, dim: Math.min(desktop.dim ?? 1, 0.45) }) {
  return ScrollTrigger.create({
    trigger,
    start: "top 55%",
    end: "bottom 45%",
    // after every pin has added its spacing
    refreshPriority: -1,
    onToggle: (st) => st.isActive && morph(shape, isDesktop() ? desktop : mobile),
  });
}
