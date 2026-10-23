"use client";

import { gsap, ScrollTrigger, finePointer, reducedMotion } from "@/lib/gsap";

/** Elements that drift toward the pointer. Returns a cleanup. */
export function magnetic(root: ParentNode, selector: string, strength = 0.35): () => void {
  if (!finePointer() || reducedMotion()) return () => {};
  const offs: Array<() => void> = [];
  root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "expo.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "expo.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * strength);
      yTo((e.clientY - r.top - r.height / 2) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    offs.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    });
  });
  return () => offs.forEach((f) => f());
}

/** Writes --fx/--fy (pointer entry point, %) so CSS can grow a fill from that spot. */
export function directionalFill(root: ParentNode, selector: string): () => void {
  const offs: Array<() => void> = [];
  root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    const set = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--fx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--fy", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    el.addEventListener("pointerenter", set);
    el.addEventListener("pointerleave", set);
    offs.push(() => {
      el.removeEventListener("pointerenter", set);
      el.removeEventListener("pointerleave", set);
    });
  });
  return () => offs.forEach((f) => f());
}

/** Count numbers up once when they scroll into view. Call inside useGSAP. */
export function countUp(root: ParentNode, selector = "[data-count]") {
  root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    const end = Number(el.dataset.count);
    if (reducedMotion()) {
      el.textContent = String(end);
      return;
    }
    const o = { v: 0 };
    el.textContent = "0";
    ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () =>
        gsap.to(o, {
          v: end,
          duration: 1.6,
          ease: "expo.out",
          onUpdate: () => (el.textContent = String(Math.round(o.v))),
        }),
    });
  });
}

/** Read the live time in a timezone, e.g. for office clocks. */
export function timeIn(tz: string, seconds = false): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    ...(seconds ? { second: "2-digit" } : {}),
  }).format(new Date());
}
