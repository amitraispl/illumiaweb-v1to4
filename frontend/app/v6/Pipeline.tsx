"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import { pages, process } from "@/lib/copy";
import { burst } from "./flux";
import { chime, blip } from "./sound";

const pts = process.map((_, i) => [60 + i * (880 / (process.length - 1)), 120 + Math.sin(i * 1.3) * 42] as const);
const D = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
/* the way back: Iterate curls under the line into Discover again */
const [lx, ly] = pts[pts.length - 1];
const [fx, fy] = pts[0];
const BACK = `M${lx} ${ly} C ${lx + 40} ${ly + 120}, ${fx - 40} ${fy + 140}, ${fx} ${fy}`;

/*
 * The seven-stage cycle, scrubbed by scroll: the line draws from Discover to
 * Iterate, packets stream along it, each stage lights and takes the panel, and
 * the last one erupts into the ink and draws the loop back to the start.
 */
export function Pipeline({ index = "03" }: { index?: string }) {
  const root = useRef<HTMLElement>(null);
  const [at, setAt] = useState(-1);
  const fired = useRef(false);

  useGSAP(
    () => {
      const el = root.current!;
      if (reducedMotion()) {
        setAt(process.length - 1);
        return;
      }
      const erupt = () => {
        if (fired.current) return;
        fired.current = true;
        const n = el.querySelector(".v6-pipe__node:last-of-type")?.getBoundingClientRect();
        if (n) burst(n.left + n.width / 2, n.top + n.height / 2, 26, 60, 1);
        chime();
      };
      const update = (p: number) => {
        const idx = Math.min(process.length - 1, Math.floor(p * process.length - 0.0001));
        setAt((prev) => {
          if (idx > prev && idx >= 0) blip(idx);
          return idx;
        });
        gsap.set(".v6-pipe__back", { drawSVG: `${Math.max(0, (p - 0.86) / 0.14) * 100}%` });
        if (p > 0.97) erupt();
        if (p < 0.6) fired.current = false;
      };
      gsap.set(".v6-pipe__back", { drawSVG: "0%" });
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        gsap.fromTo(".v6-pipe__run", { drawSVG: "0%" }, {
          drawSVG: "100%", ease: "none",
          scrollTrigger: {
            trigger: el, start: "top top", end: "+=240%", pin: true, scrub: true,
            onUpdate: (st) => update(st.progress),
          },
        });
      });
      mm.add("(max-width: 899px)", () => {
        gsap.fromTo(".v6-pipe__run", { drawSVG: "0%" }, { drawSVG: "100%", ease: "none", scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 60%", scrub: true, onUpdate: (st) => update(st.progress) } });
      });
    },
    { scope: root },
  );

  const now = process[Math.max(at, 0)];
  const last = at === process.length - 1;

  return (
    <section ref={root} className="v6-pipe" aria-labelledby="v6-pipe-title">
      <div className="v6-pipe__head">
        <p className="v6-eyebrow">{index} · {pages.processHead.eyebrow}</p>
        <h2 id="v6-pipe-title">A cycle, <em>not a straight line.</em></h2>
        <p>{pages.processPage.lede}</p>
      </div>
      <div className="v6-pipe__stage">
        <svg viewBox="0 0 1000 300" className="v6-pipe__svg" aria-hidden="true">
          <path d={D} className="v6-pipe__base" />
          <path d={BACK} className="v6-pipe__base v6-pipe__base--back" />
          <path d={D} className="v6-pipe__run" />
          <path d={BACK} className="v6-pipe__run v6-pipe__back" />
          {Array.from({ length: 6 }).map((_, i) => (
            <circle key={i} r="4" className="v6-pipe__packet" style={{ offsetPath: `path("${D}")`, animationDelay: `${i * -0.5}s` }} />
          ))}
          {pts.map(([x, y], i) => (
            <g key={i} className={`v6-pipe__node${i <= at ? " is-on" : ""}${i === at ? " is-now" : ""}`} transform={`translate(${x} ${y})`}>
              <circle r="16" />
              <text y="44" textAnchor="middle">{process[i].name}</text>
            </g>
          ))}
        </svg>
        <div className="v6-pipe__log" aria-live="polite">
          <p className="v6-pipe__bar"><i /><i /><i /> stage {String(Math.max(at, 0) + 1).padStart(2, "0")} / {String(process.length).padStart(2, "0")}</p>
          <h3 key={now.name} className="v6-pipe__now">{now.name}</h3>
          <p key={`b${now.name}`} className="v6-pipe__body">{now.body}</p>
          <p className="is-ok">{last ? `↺ ${pages.processPage.loop}` : "Every stage stays open to what the next one learns."}</p>
        </div>
      </div>
      <ol className="sr-only">
        {process.map((p) => <li key={p.name}><b>{p.name}.</b> {p.body}</li>)}
      </ol>
    </section>
  );
}
