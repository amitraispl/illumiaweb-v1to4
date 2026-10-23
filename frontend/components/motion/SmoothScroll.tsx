"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, reducedMotion } from "@/lib/gsap";

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function SmoothScroll({ children, duration = 1.15 }: { children: ReactNode; duration?: number }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // automated browsers (audits, screenshots) drive scroll programmatically; give them native scrolling
    if (reducedMotion() || navigator.webdriver) return;
    const instance = new Lenis({ duration, smoothWheel: true });
    const raf = (time: number) => instance.raf(time * 1000);
    instance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    // Lenis is an external instance created on mount; exposing it via state is intended.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);
    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      setLenis(null);
    };
  }, [duration]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
