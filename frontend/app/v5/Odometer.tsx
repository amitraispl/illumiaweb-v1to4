"use client";

import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";

/*
 * Each column is a strip whose first cell is the real digit, followed by the
 * nineteen digits before it. The page renders the right value with no script;
 * the animation starts at the far end of the strip and rolls up to the top.
 */
const strip = (d: number) => Array.from({ length: 20 }, (_, k) => (d - k + 20) % 10);

/* Digits roll past like a mechanical counter before settling on the value. */
export function Odometer({ value, suffix = "" }: { value: number; suffix?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const digits = String(value).split("").map(Number);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const strips = gsap.utils.toArray<HTMLElement>(".v5-odo__strip", root.current);
      gsap.fromTo(strips, { yPercent: -95 }, {
        yPercent: 0, duration: 2.4, ease: "expo.out", stagger: 0.14,
        scrollTrigger: { trigger: root.current, start: "top 88%" },
      });
    },
    { scope: root },
  );

  return (
    <span ref={root} className="v5-odo">
      <span className="sr-only">{value}{suffix}</span>
      {digits.map((d, i) => (
        <span key={i} className="v5-odo__col" aria-hidden="true">
          <span className="v5-odo__strip">
            {strip(d).map((n, k) => <span key={k}>{n}</span>)}
          </span>
        </span>
      ))}
      {suffix && <span className="v5-odo__suf" aria-hidden="true">{suffix}</span>}
    </span>
  );
}
