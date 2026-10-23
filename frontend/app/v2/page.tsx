"use client";

import { useRef, useState } from "react";
import { TLink } from "@/components/motion/Transition";
import { ProjectCover, CodePane, sampleCode } from "@/components/ui/Fragments";
import { onPageEnter } from "@/components/motion/onEnter";
import { countUp } from "@/components/motion/effects";
import { gsap, ScrollTrigger, SplitText, useGSAP, ease, reducedMotion, finePointer } from "@/lib/gsap";
import { company, process, projects, services, type Project } from "@/lib/content";

/* which interface fragment previews each service */
const coverFor: Record<string, Project["cover"]> = {
  product: "intake", erp: "erp", ai: "assistant", platform: "migrate", secure: "network", modernise: "field",
};

export default function EditorialHome() {
  const root = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState(0);

  useGSAP(
    () => {
      const el = root.current!;
      countUp(el);
      if (reducedMotion()) return;

      /* --- masthead: letters rise one by one, then the line under it draws --- */
      const mast = SplitText.create(".v2-hero__title", { type: "chars,words", mask: "chars", charsClass: "ch" });
      gsap.set(mast.chars, { yPercent: 105 });
      gsap.set([".v2-hero__lede", ".v2-hero__cta", ".v2-hero__aside > *"], { autoAlpha: 0, y: 24 });
      gsap.set(".v2-hero__rule", { scaleX: 0 });
      const off = onPageEnter("v2", () =>
        gsap
          .timeline()
          .to(mast.chars, { yPercent: 0, duration: 1, stagger: 0.03, ease: ease.out })
          .to(".v2-hero__rule", { scaleX: 1, duration: 1.1, ease: ease.wipe }, 0.3)
          .to([".v2-hero__lede", ".v2-hero__cta", ".v2-hero__aside > *"], { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.9, ease: ease.out }, 0.5),
      );

      /* masthead letters spread apart as you scroll away */
      gsap.to(mast.chars, {
        x: (i: number) => (i - mast.chars.length / 2) * 6, ease: "none",
        scrollTrigger: { trigger: ".v2-hero", start: "top top", end: "bottom top", scrub: true },
      });

      /* --- window → full screen: the product opens to the whole viewport --- */
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: ".v2-open", start: "top top", end: "+=140%", pin: true, scrub: 0.5 } })
          .fromTo(".v2-open__frame", { clipPath: "inset(30% 34% 30% 34% round 16px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" })
          .fromTo(".v2-open__frame > *", { scale: 1.25 }, { scale: 1, ease: "none" }, 0)
          .to(".v2-open__left", { xPercent: -60, autoAlpha: 0, ease: "none" }, 0)
          .to(".v2-open__right", { xPercent: 60, autoAlpha: 0, ease: "none" }, 0);
      });

      /* --- statement fills with ink word by word --- */
      const words = SplitText.create(".v2-ink", { type: "words" });
      gsap.fromTo(words.words, { color: "#9a9aa2" }, {
        color: "#26262b", stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: ".v2-ink", start: "top 80%", end: "bottom 50%", scrub: true },
      });

      /* --- index rows: line draws, text rises --- */
      gsap.utils.toArray<HTMLElement>(".v2-index__row").forEach((row) => {
        gsap.from(row, {
          "--line": 0, duration: 1.2, ease: ease.wipe,
          scrollTrigger: { trigger: row, start: "top 88%" },
        });
        gsap.from(row.querySelectorAll(".v2-index__name, .v2-index__short"), {
          yPercent: 60, autoAlpha: 0, duration: 1, stagger: 0.08, ease: ease.out,
          scrollTrigger: { trigger: row, start: "top 88%" },
        });
      });

      /* floating preview follows the pointer over the index */
      if (finePointer()) {
        const pv = el.querySelector<HTMLElement>(".v2-preview")!;
        const list = el.querySelector<HTMLElement>(".v2-index")!;
        gsap.set(pv, { xPercent: -50, yPercent: -50, scale: 0.6, autoAlpha: 0 });
        const x = gsap.quickTo(pv, "x", { duration: 0.6, ease: "power3.out" });
        const y = gsap.quickTo(pv, "y", { duration: 0.6, ease: "power3.out" });
        const rot = gsap.quickTo(pv, "rotation", { duration: 0.8, ease: "power3.out" });
        let lastX = 0;
        const move = (e: PointerEvent) => {
          const r = list.getBoundingClientRect();
          x(e.clientX - r.left);
          y(e.clientY - r.top);
          rot(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
          lastX = e.clientX;
        };
        const enter = () => gsap.to(pv, { autoAlpha: 1, scale: 1, duration: 0.5, ease: ease.out });
        const leave = () => gsap.to(pv, { autoAlpha: 0, scale: 0.6, duration: 0.4, ease: ease.exit });
        list.addEventListener("pointermove", move);
        list.addEventListener("pointerenter", enter);
        list.addEventListener("pointerleave", leave);
      }

      /* --- marquee of service names, direction follows scroll direction --- */
      const band = gsap.to(".v2-band__track", { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
      ScrollTrigger.create({
        trigger: ".v2-band", start: "top bottom", end: "bottom top",
        onUpdate: (st) => gsap.to(band, { timeScale: st.direction * (1 + Math.min(4, Math.abs(st.getVelocity()) / 800)), duration: 0.4, overwrite: true }),
      });

      /* --- work: covers open from a horizontal slit, image drifts inside --- */
      gsap.utils.toArray<HTMLElement>(".v2-work__item").forEach((it) => {
        gsap.fromTo(it.querySelector(".v2-work__cover"), { clipPath: "inset(50% 0 50% 0)" }, {
          clipPath: "inset(0% 0 0% 0)", duration: 1.4, ease: ease.wipe,
          scrollTrigger: { trigger: it, start: "top 85%" },
        });
        gsap.fromTo(it.querySelector(".v2-work__cover > *"), { yPercent: -8 }, {
          yPercent: 8, ease: "none",
          scrollTrigger: { trigger: it, start: "top bottom", end: "bottom top", scrub: true },
        });
        gsap.from(it.querySelectorAll(".v2-work__meta > *"), {
          y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.9, ease: ease.out,
          scrollTrigger: { trigger: it, start: "top 75%" },
        });
      });

      /* --- process: sheets stack like pages of the brief --- */
      gsap.utils.toArray<HTMLElement>(".v2-sheet").forEach((sheet, i, all) => {
        if (i === all.length - 1) return;
        gsap.to(sheet, {
          scale: 0.94, ease: "none",
          scrollTrigger: { trigger: all[i + 1], start: "top bottom", end: "top 15%", scrub: true },
        });
      });

      return off;
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v2-page">
      {/* HERO */}
      <section className="v2-hero" aria-labelledby="v2-title">
        <h1 id="v2-title" className="v2-hero__title">
          <span className="v2-hero__l1">Software,</span>
          <span className="v2-hero__l2"><em>set</em> well</span>
        </h1>
        <hr className="v2-hero__rule" />
        <div className="v2-hero__grid">
          <p className="v2-hero__lede">
            The software wing of Illumia Solutions. We design, build and secure web, mobile, ERP and AI
            products for companies that need them to work on Monday morning.
          </p>
          <div className="v2-hero__cta">
            <TLink href="/v2/contact" className="v2-btn" label="Contact">Start a project</TLink>
          </div>
          <dl className="v2-hero__aside">
            {company.stats.slice(0, 2).map((s) => (
              <div key={s.label}>
                <dd><span data-count={s.value}>{s.value}</span>{s.suffix}</dd>
                <dt>{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* WINDOW → FULL SCREEN */}
      <section className="v2-open" aria-labelledby="v2-open-title">
        <div className="v2-open__frame"><CodePane lines={sampleCode} title="deploy.ts" /></div>
        <h2 id="v2-open-title" className="v2-open__title">
          <span className="v2-open__left">Built in</span> <span className="v2-open__right"><em>the open</em></span>
        </h2>
      </section>

      {/* STATEMENT */}
      <section className="v2-intro" aria-label="Our approach">
        <p className="v2-ink">
          You see the plan, the code, the tests and the invoice every two weeks. Nothing is hidden, so
          nothing surprises you on launch day.
        </p>
        <div className="v2-intro__side">
          <p>
            Engineers who also hold {company.certifications.join(", ")} write the code and sign the security
            review. Partners include {company.partners.slice(0, 3).join(", ")}.
          </p>
        </div>
      </section>

      {/* SERVICES INDEX */}
      <section className="v2-services" aria-labelledby="v2-svc-title">
        <div className="v2-services__head">
          <h2 id="v2-svc-title">What we make</h2>
          <TLink href="/v2/services" className="v2-ul" label="Services">Read the full index</TLink>
        </div>
        <div className="v2-index">
        <ul role="list">
          {services.map((s, i) => (
            <li key={s.slug} className="v2-index__row" onPointerEnter={() => setPreview(i)}>
              <TLink href={`/v2/services#${s.slug}`} className="v2-index__link" data-cursor="Read" label="Services">
                <span className="v2-index__name">{s.name}</span>
                <span className="v2-index__short">{s.short}</span>
              </TLink>
            </li>
          ))}
        </ul>
          <div className="v2-preview" aria-hidden="true">
            <ProjectCover kind={coverFor[services[preview].slug]} />
          </div>
        </div>
      </section>

      {/* BAND */}
      <section className="v2-band" aria-hidden="true">
        <div className="v2-band__track">
          {[...services, ...services].map((s, i) => (
            <span key={i}>{s.name}<svg viewBox="0 0 20 20"><path d="M10 0v20M0 10h20M3 3l14 14M17 3 3 17" /></svg></span>
          ))}
        </div>
      </section>

      {/* WORK */}
      <section className="v2-work" aria-labelledby="v2-work-title">
        <div className="v2-services__head">
          <h2 id="v2-work-title">Recent work</h2>
          <TLink href="/v2/work" className="v2-ul" label="Work">All projects</TLink>
        </div>
        <div className="v2-work__grid">
          {projects.slice(0, 4).map((p) => (
            <TLink key={p.slug} href="/v2/work" className="v2-work__item" data-cursor="View" label={p.name}>
              <div className="v2-work__cover"><ProjectCover kind={p.cover} /></div>
              <div className="v2-work__meta">
                <h3>{p.name}</h3>
                <p>{p.summary}</p>
                <span>{p.sector}, concept</span>
              </div>
            </TLink>
          ))}
        </div>
      </section>

      {/* PROCESS SHEETS */}
      <section className="v2-process" aria-labelledby="v2-process-title">
        <h2 id="v2-process-title" className="v2-process__title">How a project runs</h2>
        <div className="v2-sheets">
          {process.map((p) => (
            <article key={p.name} className="v2-sheet">
              <h3>{p.name}</h3>
              <p>{p.body}</p>
              <span>{p.weeks}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
