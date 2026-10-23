"use client";

import { useRef, useState, type FormEvent } from "react";
import { TLink } from "@/components/motion/Transition";
import { ProjectCover } from "@/components/ui/Fragments";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, ScrollTrigger, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { company, projects } from "@/lib/content";
import { Building, floors } from "./Building";
import { Overlap } from "./Overlap";

/* SAMPLE: a typical budget split across phases; confirm with Illumia before launch */
const plan = [
  { phase: "Discovery", share: 10, note: "Brief, prototype, fixed quote" },
  { phase: "Design", share: 15, note: "Flows, interface, architecture" },
  { phase: "Build", share: 50, note: "Sprints with a demo every two weeks" },
  { phase: "Harden", share: 15, note: "Security review, load tests, documents" },
  { phase: "Launch", share: 10, note: "Staged rollout and handover" },
];

export default function BlueprintHome() {
  const root = useRef<HTMLDivElement>(null);
  const [joined, setJoined] = useState(false);

  useGSAP(
    () => {
      const el = root.current!;
      if (reducedMotion()) return;

      /* --- hero: the building draws itself floor by floor, then the title surfaces --- */
      const title = SplitText.create(".v4-hero__title", { type: "lines", mask: "lines", linesClass: "ln" });
      gsap.set(title.lines, { yPercent: 105 });
      gsap.set([".v4-hero__sub", ".v4-hero__links"], { autoAlpha: 0, y: 20 });
      gsap.set(".v4-hero__art .b-top, .v4-hero__art .b-side", { fillOpacity: 0 });
      gsap.set(".v4-hero__art path", { drawSVG: "0%" });
      const off = onPageEnter("v4", () =>
        gsap
          .timeline()
          .to(".v4-hero__art .b-cols path", { drawSVG: "100%", duration: 1.4, stagger: 0.1, ease: "power2.inOut" })
          .to(".v4-hero__art .b-floor path", { drawSVG: "100%", duration: 1.2, stagger: 0.04, ease: "power2.inOut" }, 0.2)
          .to(".v4-hero__art .b-top, .v4-hero__art .b-side", { fillOpacity: 1, duration: 1.2, stagger: 0.05, ease: "power1.out" }, 1)
          .to(title.lines, { yPercent: 0, duration: 1.4, stagger: 0.12, ease: ease.out }, 0.3)
          .to([".v4-hero__sub", ".v4-hero__links"], { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.1, ease: ease.out }, 0.8),
      );

      /* hero art drifts slower than the page */
      gsap.to(".v4-hero__art", {
        yPercent: 20, scale: 0.92, ease: "none",
        scrollTrigger: { trigger: ".v4-hero", start: "top top", end: "bottom top", scrub: true },
      });

      /* --- the floors: pinned building, each floor lights as its text arrives --- */
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1000px)", () => {
        ScrollTrigger.create({
          trigger: ".v4-floors", start: "top top", end: "bottom bottom", pin: ".v4-floors__art",
        });
      });
      gsap.utils.toArray<HTMLElement>(".v4-floor").forEach((f, i) => {
        ScrollTrigger.create({
          trigger: f, start: "top 60%", end: "bottom 40%",
          onToggle: (st) => {
            el.querySelector(`.v4-floors__art .b-floor[data-floor="${i}"]`)?.classList.toggle("is-lit", st.isActive);
            f.classList.toggle("is-lit", st.isActive);
          },
        });
        gsap.from(f.querySelectorAll(".v4-floor > *"), {
          y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease: ease.out,
          scrollTrigger: { trigger: f, start: "top 80%" },
        });
      });

      /* --- view from above: a horizontal gallery that opens each picture as it arrives --- */
      mm.add("(min-width: 900px)", () => {
        const track = el.querySelector<HTMLElement>(".v4-gallery__track")!;
        const dist = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -dist(), ease: "none",
          scrollTrigger: { trigger: ".v4-gallery", start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
        });
        gsap.utils.toArray<HTMLElement>(".v4-shot").forEach((s) => {
          gsap.fromTo(s.querySelector(".v4-shot__img"), { clipPath: "inset(12% 12% 12% 12%)" }, {
            clipPath: "inset(0% 0% 0% 0%)", ease: "none",
            scrollTrigger: { trigger: s, containerAnimation: tween, start: "left 95%", end: "left 35%", scrub: true },
          });
        });
      });

      /* --- plan: each bar grows to its share --- */
      gsap.utils.toArray<HTMLElement>(".v4-plan__row").forEach((r, i) => {
        gsap.from(r.querySelector(".v4-plan__fill"), {
          scaleX: 0, duration: 1.6, delay: i * 0.08, ease: ease.out,
          scrollTrigger: { trigger: ".v4-plan", start: "top 75%" },
        });
        gsap.from(r.querySelectorAll("span, b"), {
          autoAlpha: 0, y: 12, duration: 0.9, delay: i * 0.08, ease: ease.out,
          scrollTrigger: { trigger: ".v4-plan", start: "top 75%" },
        });
      });

      /* --- each section heading rises line by line --- */
      gsap.utils.toArray<HTMLElement>(".v4-h").forEach((h) => {
        const s = SplitText.create(h, { type: "lines", mask: "lines", linesClass: "ln" });
        gsap.from(s.lines, { yPercent: 105, duration: 1.3, stagger: 0.1, ease: ease.out, scrollTrigger: { trigger: h, start: "top 85%" } });
      });

      return off;
    },
    { scope: root },
  );

  const join = (e: FormEvent) => {
    e.preventDefault();
    // TODO: connect to Illumia's enquiry endpoint before launch.
    setJoined(true);
  };

  return (
    <div ref={root} className="v4-page">
      {/* HERO */}
      <section className="v4-hero" aria-labelledby="v4-title">
        <div className="v4-hero__text">
          <h1 id="v4-title" className="v4-hero__title">Software, <em>built</em> to stand</h1>
          <p className="v4-hero__sub">
            Illumia&rsquo;s software wing designs systems the way architects design buildings: foundation
            first, every floor load-tested, a facade people enjoy using.
          </p>
          <div className="v4-hero__links">
            <TLink href="/v4/contact" className="v4-btn" label="Contact">Plan your build</TLink>
            <a href="#floors" className="v4-link">Walk the floors</a>
          </div>
        </div>
        <Building className="v4-hero__art" />
      </section>

      {/* FLOORS */}
      <section id="floors" className="v4-floors" aria-labelledby="v4-floors-title">
        <div className="v4-floors__art"><Building /></div>
        <div className="v4-floors__text">
          <h2 id="v4-floors-title" className="v4-h">Five floors, one building</h2>
          {/* foundation first, as the hero promises */}
          {floors.map((f) => (
            <article key={f.key} className="v4-floor">
              <p className="v4-floor__line"><em>{f.line}</em></p>
              <h3>{f.name}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* OFFICES / OVERLAP */}
      <section className="v4-near" aria-labelledby="v4-near-title">
        <div className="v4-near__head">
          <h2 id="v4-near-title" className="v4-h">Closer than it looks</h2>
          <p>
            Six offices across Asia, Africa, Australia and North America. Whatever your timezone, part of the
            team is at work while you are.
          </p>
        </div>
        <Overlap />
      </section>

      {/* GALLERY */}
      <section className="v4-gallery" aria-labelledby="v4-gal-title">
        <div className="v4-gallery__track">
          <div className="v4-gallery__intro">
            <h2 id="v4-gal-title" className="v4-h">The view from above</h2>
            <p>Concept builds that show the kind of systems we design. Client work is shared on request.</p>
            <TLink href="/v4/work" className="v4-link" label="Work">See every project</TLink>
          </div>
          {projects.map((p) => (
            <article key={p.slug} className="v4-shot">
              <div className="v4-shot__img"><ProjectCover kind={p.cover} /></div>
              <h3>{p.name}</h3>
              <p>{p.sector}, concept</p>
            </article>
          ))}
        </div>
      </section>

      {/* PLAN */}
      <section className="v4-plan" aria-labelledby="v4-plan-title">
        <div className="v4-plan__head">
          <h2 id="v4-plan-title" className="v4-h">Where the budget goes</h2>
          <p>A typical split for a new product. Half the money goes into building, and a quarter into making sure it holds.</p>
        </div>
        <ul role="list" className="v4-plan__list">
          {plan.map((p) => (
            <li key={p.phase} className="v4-plan__row">
              <span className="v4-plan__phase">{p.phase}</span>
              <span className="v4-plan__bar"><i className="v4-plan__fill" style={{ width: `${p.share * 2}%` }} /></span>
              <b>{p.share}%</b>
              <span className="v4-plan__note">{p.note}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* BEGIN */}
      <section className="v4-begin" aria-labelledby="v4-begin-title">
        <h2 id="v4-begin-title" className="v4-h">Let&rsquo;s begin</h2>
        {joined ? (
          <p className="v4-begin__done" role="status">Thank you. We will be in touch within one working day.</p>
        ) : (
          <form className="v4-begin__form" onSubmit={join}>
            <label><span>First name</span><input name="first" required autoComplete="given-name" /></label>
            <label><span>Last name</span><input name="last" autoComplete="family-name" /></label>
            <label className="v4-begin__wide"><span>Work email</span><input name="email" type="email" required autoComplete="email" /></label>
            <label className="v4-begin__check">
              <input type="checkbox" required />
              <span>I agree that Illumia may contact me about my enquiry.</span>
            </label>
            <button className="v4-btn" type="submit">Send</button>
          </form>
        )}
        <p className="v4-begin__alt">Prefer to talk? Call <a className="v4-link" href={company.phoneHref}>{company.phone}</a>.</p>
      </section>
    </div>
  );
}
