"use client";

import { gsap, finePointer, reducedMotion } from "@/lib/gsap";

/** Cards lean toward the pointer and write --gx/--gy so CSS can place a glare. Returns a cleanup. */
export function tilt(root: ParentNode, selector: string, max = 9): () => void {
  if (!finePointer() || reducedMotion()) return () => {};
  const offs: Array<() => void> = [];
  root.querySelectorAll<HTMLElement>(selector).forEach((c) => {
    const rx = gsap.quickTo(c, "rotateX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(c, "rotateY", { duration: 0.6, ease: "power3.out" });
    gsap.set(c, { transformPerspective: 900 });
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * max * 2);
      rx((0.5 - py) * max * 2);
      c.style.setProperty("--gx", `${px * 100}%`);
      c.style.setProperty("--gy", `${py * 100}%`);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerleave", leave);
    offs.push(() => {
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerleave", leave);
    });
  });
  return () => offs.forEach((f) => f());
}
