"use client";

import { useRef, useState, type FormEvent } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, ScrollTrigger, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { agile, company, intro, ownership, pages, process, stats } from "@/lib/copy";
import { Building, floors } from "./Building";
import { Overlap } from "./Overlap";

/* the seven stages as a survey: each bar marks how far round the cycle a stage sits */
const plan = process.map((p, i) => ({ phase: p.name, share: Math.round(((i + 1) / process.length) * 50), note: p.body }));

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

      /* --- what you keep: a horizontal gallery that opens each file as it arrives --- */
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

      /* --- the cycle: each bar grows to its place in the loop --- */
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
          <p className="v4-hero__kicker"><em>{intro.eyebrow}</em></p>
          <h1 id="v4-title" className="v4-hero__title">{`${intro.title[0]},`} <em>{intro.title[1]}</em> {intro.title[2]}</h1>
          <p className="v4-hero__sub">{intro.lede}</p>
          <div className="v4-hero__links">
            <TLink href="/v4/contact" className="v4-btn" label="Contact">{pages.hero.primary}</TLink>
            <TLink href="/v4/services" className="v4-link" label="Services">{pages.hero.secondary}</TLink>
          </div>
        </div>
        <Building className="v4-hero__art" />
      </section>

      {/* FLOORS */}
      <section id="floors" className="v4-floors" aria-labelledby="v4-floors-title">
        <div className="v4-floors__art"><Building /></div>
        <div className="v4-floors__text">
          <h2 id="v4-floors-title" className="v4-h">{pages.servicesHead.title}</h2>
          <p className="v4-floors__about">{intro.about}</p>
          {/* foundation first, the way the building is drawn */}
          {floors.map((f) => (
            <article key={f.key} className="v4-floor">
              <p className="v4-floor__line"><em>{f.line}</em></p>
              <h3>{f.name}</h3>
              <p>{f.body}</p>
              <TLink href={`/v4/services/${f.key}`} className="v4-link" label={f.name}>Read more</TLink>
            </article>
          ))}
        </div>
      </section>

      {/* OFFICES / OVERLAP */}
      <section className="v4-near" aria-labelledby="v4-near-title">
        <div className="v4-near__head">
          <h2 id="v4-near-title" className="v4-h">{pages.officesHead.title}</h2>
          <p>{pages.officesHead.body}</p>
        </div>
        <Overlap />
      </section>

      {/* GALLERY */}
      <section className="v4-gallery" aria-labelledby="v4-gal-title">
        <div className="v4-gallery__track">
          <div className="v4-gallery__intro">
            <h2 id="v4-gal-title" className="v4-h">{pages.ownershipHead.title}</h2>
            <p>Every repository, design file and credential is handed over. Nothing stays behind with us.</p>
            <TLink href="/v4/process" className="v4-link" label="Process">How we work</TLink>
          </div>
          {ownership.map((o) => (
            <article key={o.name} className="v4-shot">
              <div className="v4-shot__img v4-shot__img--file">
                <pre aria-hidden="true">{o.snippet.map((l) => <code key={l}>{l}</code>)}</pre>
              </div>
              <h3>{o.name}</h3>
              <p>{o.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* PLAN */}
      <section className="v4-plan" aria-labelledby="v4-plan-title">
        <div className="v4-plan__head">
          <h2 id="v4-plan-title" className="v4-h">{pages.processHead.title}</h2>
          <p>{agile.body}</p>
          <dl className="v4-plan__stats">
            {stats.map((s) => (
              <div key={s.label}><dd>{s.value}{s.suffix}</dd><dt>{s.label}</dt></div>
            ))}
          </dl>
        </div>
        <ul role="list" className="v4-plan__list">
          {plan.map((p) => (
            <li key={p.phase} className="v4-plan__row">
              <span className="v4-plan__phase">{p.phase}</span>
              <span className="v4-plan__bar"><i className="v4-plan__fill" style={{ width: `${p.share * 2}%` }} /></span>
              <b>{p.phase === plan[plan.length - 1].phase ? "↺" : `0${plan.indexOf(p) + 1}`}</b>
              <span className="v4-plan__note">{p.note}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* BEGIN */}
      <section className="v4-begin" aria-labelledby="v4-begin-title">
        <h2 id="v4-begin-title" className="v4-h">{pages.footer.ask}</h2>
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
        <p className="v4-begin__alt">
          Prefer to talk? Call <a className="v4-link" href={company.phoneHref}>{company.phone}</a> or write to{" "}
          <a className="v4-link" href={`mailto:${company.email}`}>{company.email}</a>.
        </p>
      </section>
    </div>
  );
}
