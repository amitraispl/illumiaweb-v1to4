"use client";

import { useEffect, useRef, useState } from "react";
import { TLink } from "@/components/motion/Transition";
import { Clock } from "@/components/motion/Clock";
import { magnetic, directionalFill, timeIn } from "@/components/motion/effects";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, ScrollTrigger, SplitText, useGSAP, ease, reducedMotion, finePointer } from "@/lib/gsap";
import { LOOK, agile, intro, ownership, process, services, stack, stats } from "./content";
import { face, morph, release, scatter, zone } from "./field";
import { offices } from "./shapes";
import { Terminal } from "./Terminal";
import { Odometer } from "./Odometer";
import { tilt } from "./tilt";

const GLYPHS = "01<>/{}[]#=+*";
const awake = (tz: string) => {
  const h = Number(timeIn(tz).slice(0, 2));
  return h >= 9 && h < 19;
};

export default function LumenHome() {
  const root = useRef<HTMLDivElement>(null);
  const [svc, setSvc] = useState(0);
  const [step, setStep] = useState(0);
  const [shot, setShot] = useState(0);
  const [awakeIn, setAwakeIn] = useState<Record<string, boolean>>({});

  /* who is at their desk right now; read after mount, so the prerender holds no clock */
  useEffect(() => {
    const read = () => setAwakeIn(Object.fromEntries(offices.map((o) => [o.tz, awake(o.tz)])));
    const first = requestAnimationFrame(read);
    const id = window.setInterval(read, 30000);
    return () => {
      cancelAnimationFrame(first);
      window.clearInterval(id);
    };
  }, []);

  useGSAP(
    () => {
      const el = root.current!;
      const offs = [magnetic(el, "[data-magnetic]"), directionalFill(el, ".v5-btn"), tilt(el, ".v5-tilt")];
      const wide = () => window.matchMedia("(min-width: 900px)").matches;

      /* every section asks the light to become something */
      zone(".v5-manifesto", "nebula", { scale: 1.15, dim: 0.5 });
      zone(".v5-stats", "terrain", { y: -0.08, scale: 1.05, dim: 0.9 }, { dim: 0.45 });
      zone(".v5-z-process", "cycle", { x: 0.6, y: 0.02, scale: 0.78, dim: 0.85 }, { y: 0.3, dim: 0.45 });
      zone(".v5-z-tunnel", "nebula", { warp: 1, dim: 0.85 }, { warp: 1, dim: 0.5 });
      zone(".v5-agile", "branches", { x: 0.42, y: 0.22, scale: 0.72, dim: 0.85 }, { y: 0.4, scale: 0.55, dim: 0.4 });
      zone(".v5-globe", "globe", { x: -0.42, scale: 0.92 }, { y: 0.4, scale: 0.75, dim: 0.6 });
      zone(".v5-shell", "nebula", { x: 0.45, dim: 0.7, scale: 0.9 }, { dim: 0.35 });

      /* the hero: the light gathers into the Illumia mark, holds, then recompiles into code */
      let toCode: gsap.core.Tween | null = null;
      // the first time, the page is still being revealed, so the mark holds a little longer
      let hold = 4.6;
      const heroPose = () => (wide() ? { x: 0.5, scale: 0.82 } : { y: 0.32, scale: 0.85, dim: 0.55 });
      const hero = ScrollTrigger.create({
        trigger: ".v5-hero", start: "top 55%", end: "bottom 45%", refreshPriority: -1,
        onToggle: (st) => {
          toCode?.kill();
          if (!st.isActive) return;
          morph("mark", heroPose());
          toCode = gsap.delayedCall(hold, () => hero.isActive && morph("code", heroPose()));
          hold = 3.2;
        },
      });
      offs.push(() => toCode?.kill());

      /* the ring takes the shape of whichever service faces you */
      let facing = 0;
      const ringPose = () => (wide() ? { scale: 1.0, dim: 0.7 } : { y: 0.36, scale: 0.7, dim: 0.4 });
      const ringZone = ScrollTrigger.create({
        trigger: ".v5-z-ring", start: "top 55%", end: "bottom 45%", refreshPriority: -1,
        onToggle: (st) => st.isActive && morph(LOOK[services[facing].slug], ringPose()),
      });

      if (reducedMotion()) return () => offs.forEach((f) => f());

      /* --- hero: letters swing up out of the floor --- */
      const split = SplitText.create(".v5-hero__title .ln", { type: "words,chars", charsClass: "ch" });
      gsap.set(split.chars, { yPercent: 80, rotateX: -95, autoAlpha: 0, transformOrigin: "50% 100% -40px" });
      gsap.set([".v5-hero__eyebrow", ".v5-hero__sub", ".v5-hero__actions", ".v5-hero__foot > *"], { autoAlpha: 0, y: 26 });
      offs.push(
        onPageEnter("v5", () => {
          gsap.timeline()
            .to(split.chars, { yPercent: 0, rotateX: 0, autoAlpha: 1, duration: 1.3, stagger: 0.022, ease: ease.out })
            .to([".v5-hero__eyebrow", ".v5-hero__sub", ".v5-hero__actions", ".v5-hero__foot > *"], { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: ease.out }, 0.5);
        }),
      );

      /* letters flinch from the pointer */
      if (finePointer()) {
        split.chars.forEach((c) => {
          const jump = () => {
            if (gsap.isTweening(c)) return;
            gsap.fromTo(c, { y: 0, rotate: 0 }, { y: "-0.18em", rotate: gsap.utils.random(-14, 14), duration: 0.25, ease: "power2.out", yoyo: true, repeat: 1 });
          };
          c.addEventListener("pointerenter", jump);
          offs.push(() => c.removeEventListener("pointerenter", jump));
        });
      }

      /* hero melts away: blur, scale and drift */
      gsap.to(".v5-hero__inner", {
        yPercent: -12, scale: 0.92, filter: "blur(10px)", autoAlpha: 0, ease: "none",
        scrollTrigger: { trigger: ".v5-hero", start: "top top", end: "bottom top", scrub: true },
      });

      /* --- manifesto: words come into focus as they pass --- */
      const words = SplitText.create(".v5-manifesto blockquote p", { type: "words" });
      gsap.fromTo(words.words, { opacity: 0.08, filter: "blur(8px)", y: 12 }, {
        opacity: 1, filter: "blur(0px)", y: 0, stagger: 0.06, ease: "none",
        scrollTrigger: { trigger: ".v5-manifesto", start: "top 80%", end: "bottom 60%", scrub: true },
      });

      /* --- stack strip: speed and lean follow scroll velocity --- */
      const rows = gsap.utils.toArray<HTMLElement>(".v5-strip__row");
      const loops = rows.map((r, i) =>
        gsap.fromTo(r, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 40, ease: "none", repeat: -1 }),
      );
      ScrollTrigger.create({
        trigger: ".v5-strip", start: "top bottom", end: "bottom top",
        onUpdate: (st) => {
          const v = gsap.utils.clamp(-8, 8, st.getVelocity() / 260);
          loops.forEach((l) => gsap.to(l, { timeScale: (1 + Math.abs(v)) * (v < 0 ? -1 : 1), duration: 0.4, overwrite: true }));
          gsap.to(rows, { skewX: -v * 1.6, duration: 0.5, overwrite: "auto" });
        },
      });

      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        /* --- services: a ring of four panels turns as you scroll --- */
        const cards = gsap.utils.toArray<HTMLElement>(".v5-ring__card");
        const spin = el.querySelector<HTMLElement>(".v5-ring__spin")!;
        const step = 360 / cards.length;
        cards.forEach((c, i) => gsap.set(c, { rotateY: i * step, transformOrigin: "50% 50% -420px" }));
        gsap.set(spin, { transformOrigin: "50% 50% -420px" });
        const shade = (rot: number) => {
          cards.forEach((c, i) => {
            const a = ((i * step + rot) * Math.PI) / 180;
            const f = (Math.cos(a) + 1) / 2;
            gsap.set(c, { opacity: 0.12 + f * 0.88, filter: `blur(${(1 - f) * 4}px)` });
          });
          const idx = ((Math.round(-rot / step) % cards.length) + cards.length) % cards.length;
          setSvc(idx);
          if (idx !== facing) {
            facing = idx;
            if (ringZone.isActive) morph(LOOK[services[idx].slug], ringPose(), 1.4);
          }
        };
        const ring = { r: 0 };
        shade(0);
        gsap.to(ring, {
          r: -step * (cards.length - 1), ease: "none",
          onUpdate: () => {
            gsap.set(spin, { rotateY: ring.r });
            shade(ring.r);
          },
          scrollTrigger: { trigger: ".v5-ring", start: "top top", end: "+=220%", pin: true, scrub: 0.8, snap: { snapTo: 1 / (cards.length - 1), duration: 0.5, ease: "power2.inOut" } },
        });

        /* --- process: pinned, the active stage advances with the scroll and the cycle pulses --- */
        let at = 0;
        ScrollTrigger.create({
          trigger: ".v5-process", start: "top top", end: "+=260%", pin: true, scrub: true,
          onUpdate: (st) => {
            gsap.set(".v5-rail__fill", { scaleX: st.progress });
            const n = Math.min(process.length - 1, Math.floor(st.progress * process.length));
            if (n !== at) {
              at = n;
              scatter(0.12, 0.9);
            }
            setStep(n);
          },
        });

        /* --- ownership: fly through what you take home --- */
        const shots = gsap.utils.toArray<HTMLElement>(".v5-tunnel__shot");
        const GAP = 1300;
        const cam = { z: 0 };
        const place = () => {
          shots.forEach((s, i) => {
            const d = cam.z - i * GAP - 700; // 0 means the card is at the screen plane
            const o = d > 260 ? Math.max(0, 1 - (d - 260) / 340) : d < -3200 ? 0 : Math.min(1, (d + 3200) / 1400);
            gsap.set(s, { z: d, opacity: o, pointerEvents: o > 0.6 ? "auto" : "none" });
          });
          setShot(Math.min(shots.length - 1, Math.max(0, Math.round((cam.z - 700) / GAP))));
        };
        shots.forEach((s, i) => gsap.set(s, { xPercent: -50, yPercent: -50, x: i % 2 ? "18vw" : "-18vw", y: i % 3 === 1 ? "-6vh" : "4vh", rotateY: i % 2 ? -14 : 14 }));
        place();
        gsap.to(cam, {
          z: GAP * (shots.length - 1) + 1200, ease: "none", onUpdate: place,
          scrollTrigger: { trigger: ".v5-tunnel", start: "top top", end: "+=340%", pin: true, scrub: 1 },
        });
      });

      gsap.from(".v5-agile .v5-tilt", {
        y: 80, autoAlpha: 0, stagger: 0.1, duration: 1.1, ease: ease.out,
        scrollTrigger: { trigger: ".v5-agile__grid", start: "top 80%" },
      });

      /* --- globe rows rise in --- */
      gsap.from(".v5-globe__list li", {
        x: 40, autoAlpha: 0, stagger: 0.07, duration: 0.9, ease: ease.out,
        scrollTrigger: { trigger: ".v5-globe__list", start: "top 80%" },
      });

      gsap.from(".v5-term", {
        y: 80, rotateX: 18, autoAlpha: 0, duration: 1.4, ease: ease.out, transformPerspective: 1200,
        scrollTrigger: { trigger: ".v5-shell", start: "top 70%" },
      });

      /* section titles decode once */
      gsap.utils.toArray<HTMLElement>("[data-decode]").forEach((h) => {
        gsap.to(h, {
          duration: 1.2, scrambleText: { text: "{original}", chars: GLYPHS, speed: 0.5, revealDelay: 0.2 },
          scrollTrigger: { trigger: h, start: "top 85%" },
        });
      });

      return () => offs.forEach((f) => f());
    },
    { scope: root },
  );

  const s = services[svc];
  const p = process[step];
  const last = step === process.length - 1;

  return (
    <div ref={root} className="v5-page">
      {/* HERO */}
      <section className="v5-hero" aria-labelledby="v5-title">
        <div className="v5-hero__inner">
          <p className="v5-eyebrow v5-hero__eyebrow">{intro.eyebrow} · Illumia Software Development</p>
          <h1 id="v5-title" className="v5-hero__title">
            <span className="ln">{intro.title[0]}</span>
            <span className="ln">{intro.title[1]}</span>
            <span className="ln"><em>{intro.title[2]}</em></span>
          </h1>
          <p className="v5-hero__sub">{intro.lede}</p>
          <div className="v5-hero__actions">
            <TLink href="/v5/contact" className="v5-btn v5-btn--solid" data-magnetic label="Contact"><span>Consult an expert</span></TLink>
            <TLink href="/v5/services" className="v5-btn" data-magnetic label="Services"><span>Explore services</span></TLink>
          </div>
          <div className="v5-hero__foot">
            <p><span className="v5-dot" aria-hidden="true" /> Move to bend the light. Click to send a shockwave.</p>
            <p>Scroll to compile it ↓</p>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="v5-manifesto" aria-label="Our philosophy">
        <blockquote>
          <p>{intro.philosophy}</p>
          <footer>Illumia Software Development Philosophy</footer>
        </blockquote>
      </section>

      {/* STACK STRIP */}
      <section className="v5-strip" aria-label="Technologies we use">
        <ul className="sr-only">{stack.map((t) => <li key={t}>{t}</li>)}</ul>
        {[0, 1].map((r) => (
          <div key={r} className="v5-strip__row" aria-hidden="true">
            {[...stack, ...stack].map((t, i) => <span key={i} className={i % 3 === 1 ? "is-solid" : undefined}>{t}</span>)}
          </div>
        ))}
      </section>

      {/* SERVICES RING (wrapped so the light zone spans the pinned distance) */}
      <div className="v5-z-ring">
        <section className="v5-ring" aria-labelledby="v5-ring-title">
          <div className="v5-ring__head">
            <p className="v5-eyebrow">01 · Core Service Architecture</p>
            <h2 id="v5-ring-title" data-decode>Four disciplines, one accountable team</h2>
            <p className="v5-ring__lede">{intro.about}</p>
          </div>
          <div className="v5-ring__stage">
            <ul className="v5-ring__spin" role="list">
              {services.map((x, i) => (
                <li key={x.slug} className="v5-ring__card" aria-current={i === svc || undefined}>
                  <span className="v5-ring__n">0{i + 1} · {x.tag}</span>
                  <h3>{x.name}</h3>
                  <p>{x.short}</p>
                  <ol role="list">
                    {x.highlights.map((h, k) => (
                      <li key={h}><small>{String(i * 3 + k + 1).padStart(2, "0")}</small>{h}</li>
                    ))}
                  </ol>
                  <TLink href={`/v5/services/${x.slug}`} className="v5-ring__more" label={x.name}>Read more <i aria-hidden="true">→</i></TLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="v5-ring__now" aria-hidden="true">
            <span>0{svc + 1} / 0{services.length}</span>
            <b>{s.name}</b>
            <i>{s.promise}</i>
          </div>
        </section>
      </div>

      {/* STATS */}
      <section className="v5-stats" aria-label="How we deliver, in numbers">
        <dl>
          {stats.map((x) => (
            <div key={x.label}>
              <dt>{x.label}</dt>
              <dd><Odometer value={x.value} suffix={x.suffix} /></dd>
            </div>
          ))}
        </dl>
      </section>

      {/* PROCESS */}
      <div className="v5-z-process">
        <section className="v5-process" aria-labelledby="v5-process-title">
          <div className="v5-process__head">
            <p className="v5-eyebrow">02 · How we work</p>
            <h2 id="v5-process-title" data-decode>A cycle, not a straight line</h2>
          </div>
          <div className="v5-process__stage" aria-hidden="true">
            <p className="v5-process__n" key={`n${step}`}>0{step + 1}</p>
            <div key={`t${step}`} className="v5-process__now">
              <h3>{p.name}</h3>
              <p>{p.body}</p>
              <span>{last ? "↺ Iterate feeds straight back into Discover" : `Stage ${step + 1} of ${process.length} · open to what the next one learns`}</span>
            </div>
          </div>
          <ol className="v5-rail">
            <span className="v5-rail__track" aria-hidden="true"><i className="v5-rail__fill" /></span>
            {process.map((x, i) => (
              <li key={x.name} className={i <= step ? "is-on" : undefined} aria-current={i === step ? "step" : undefined}>
                <b>{x.name}</b>
                <span className="v5-rail__body">{x.body}</span>
                <small>{i === process.length - 1 ? "↺ back to 01" : `0${i + 1}`}</small>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* OWNERSHIP TUNNEL */}
      <div className="v5-z-tunnel">
        <section className="v5-tunnel" aria-labelledby="v5-own-title">
          <div className="v5-tunnel__head">
            <p className="v5-eyebrow">03 · Full Transparency</p>
            <h2 id="v5-own-title" data-decode>Own everything you pay for</h2>
            <p className="v5-tunnel__count" aria-hidden="true">
              <b>{ownership[shot].name}</b> <span>0{shot + 1} / 0{ownership.length}</span>
            </p>
          </div>
          <div className="v5-tunnel__world">
            {ownership.map((x) => (
              <article key={x.name} className="v5-tunnel__shot">
                <pre className="v5-tunnel__file" aria-hidden="true">
                  <span className="v5-tunnel__bar"><i /><i /><i /></span>
                  {x.snippet.map((l) => <code key={l} className={l.startsWith("✓") ? "is-ok" : undefined}>{l}</code>)}
                </pre>
                <div className="v5-tunnel__meta">
                  <h3>{x.name}</h3>
                  <p>{x.body}</p>
                </div>
              </article>
            ))}
          </div>
          <TLink href="/v5/process" className="v5-link v5-tunnel__all" label="Process">How we work</TLink>
        </section>
      </div>

      {/* AGILE */}
      <section className="v5-agile" aria-labelledby="v5-agile-title">
        <div className="v5-agile__text">
          <p className="v5-eyebrow">04 · Agile Delivery</p>
          <h2 id="v5-agile-title" data-decode>{agile.title}</h2>
          <p>{agile.body}</p>
        </div>
        <div className="v5-agile__grid">
          {agile.points.map((x, i) => (
            <article key={x.name} className="v5-tilt">
              <span className="v5-tilt__n">0{i + 1}</span>
              <h3>{x.name}</h3>
              <p>{x.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* GLOBE */}
      <section className="v5-globe" aria-labelledby="v5-globe-title">
        <div className="v5-globe__text">
          <p className="v5-eyebrow">05 · Offices</p>
          <h2 id="v5-globe-title" data-decode>Engineered in Kolkata. Supported across six time zones.</h2>
          <p>Point at a city and the light turns to face it. Sprint reviews land in your working day, and post-launch support follows the sun.</p>
          <ul className="v5-globe__list" role="list">
            {offices.map((o) => {
              const on = awakeIn[o.tz];
              return (
                <li key={o.country}>
                  <button
                    type="button"
                    onPointerEnter={() => face(o.lat, o.lon)}
                    onFocus={() => face(o.lat, o.lon)}
                    onPointerLeave={release}
                    onBlur={release}
                  >
                    <span className="v5-globe__city">{o.city}<small>{o.country}{o.hq ? " · HQ" : ""}</small></span>
                    <Clock tz={o.tz} />
                    <span className={`v5-globe__state ${on ? "is-on" : ""}`}>{on === undefined ? " " : on ? "At their desks" : "On call"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* TERMINAL */}
      <section className="v5-shell" aria-labelledby="v5-shell-title">
        <div className="v5-shell__text">
          <p className="v5-eyebrow">06 · Try it</p>
          <h2 id="v5-shell-title" data-decode>Talk to the site</h2>
          <p>
            It is a real shell. Read up on a service, push a sprint to staging, or tell the light what to become.
            Press <kbd>Tab</kbd> to complete, <kbd>↑</kbd> for history.
          </p>
        </div>
        <Terminal />
      </section>
    </div>
  );
}
