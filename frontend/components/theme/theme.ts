"use client";

import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { reducedMotion } from "@/lib/gsap";
import { chromes, themeAttr, THEME_EVENT, type Theme } from "./script";

export { THEME_EVENT, type Theme };

export function readTheme(key: string): Theme {
  return document.documentElement.getAttribute(themeAttr(key)) === "dark" ? "dark" : "light";
}

/** Put the theme on <html>, colour the browser chrome, remember it, and tell any canvas. */
export function applyTheme(key: string, t: Theme) {
  document.documentElement.setAttribute(themeAttr(key), t);
  const chrome = chromes[key];
  if (chrome) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", chrome[t]);
  try {
    localStorage.setItem(`${key}-theme`, t);
  } catch {}
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { key, theme: t } }));
}

/** Spread a DOM change out of a point in a circle (View Transitions), or just make it. */
export function circleReveal(swap: () => void, from?: HTMLElement | null) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (!doc.startViewTransition || reducedMotion()) return swap();
  const b = from?.getBoundingClientRect();
  const x = b ? b.left + b.width / 2 : window.innerWidth - 60;
  const y = b ? b.top + b.height / 2 : 40;
  const rad = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const html = document.documentElement;
  html.classList.add("theme-vt");
  doc
    .startViewTransition(swap)
    .ready.then(
      () =>
        html.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
          { duration: 700, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
        ).finished,
    )
    .catch(() => {})
    .finally(() => html.classList.remove("theme-vt"));
}

/** The current theme and a switch that spreads the new one out of the button. */
export function useTheme(key: string) {
  const [theme, setTheme] = useState<Theme>("light");

  // read <html> once mounted, so the server render and hydration agree
  useEffect(() => {
    const id = requestAnimationFrame(() => setTheme(readTheme(key)));
    return () => cancelAnimationFrame(id);
  }, [key]);

  const toggle = useCallback(
    (e?: { currentTarget: HTMLElement }) => {
      const next: Theme = readTheme(key) === "dark" ? "light" : "dark";
      circleReveal(() => {
        flushSync(() => setTheme(next));
        applyTheme(key, next);
      }, e?.currentTarget);
    },
    [key],
  );

  return [theme, toggle] as const;
}
