"use client";

import { useRef, useState } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { pages, promises, services } from "@/lib/copy";

export default function EditorialServices() {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string>(services[0].slug);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v2-sub__title", { type: "chars", mask: "chars", charsClass: "ch" });
      gsap.set(t.chars, { yPercent: 105 });
      gsap.set(".v2-acc__item", { autoAlpha: 0, y: 40 });
      return onPageEnter("v2", () =>
        gsap
          .timeline()
          .to(t.chars, { yPercent: 0, stagger: 0.04, duration: 1.1, ease: ease.out })
          .to(".v2-acc__item", { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.9, ease: ease.out }, 0.3),
      );
    },
    { scope: root },
  );

  /* accordion body animates its height open */
  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>(".v2-acc__panel");
      panels.forEach((p) => {
        const isOpen = p.dataset.slug === open;
        gsap.to(p, { height: isOpen ? "auto" : 0, duration: reducedMotion() ? 0 : 0.8, ease: ease.wipe });
        if (isOpen && !reducedMotion()) {
          gsap.fromTo(p.querySelectorAll(".v2-acc__inner > *"), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.7, delay: 0.2, ease: ease.out });
        }
      });
    },
    { scope: root, dependencies: [open] },
  );

  return (
    <div ref={root} className="v2-page v2-sub">
      <header className="v2-sub__head">
        <h1 className="v2-sub__title">The <em>index</em></h1>
        <p className="v2-sub__lede">{pages.servicesPage.lede}</p>
      </header>

      <div className="v2-acc">
        {services.map((s) => {
          const isOpen = open === s.slug;
          return (
            <section key={s.slug} id={s.slug} className="v2-acc__item" data-open={isOpen}>
              <h2>
                <button
                  className="v2-acc__trigger"
                  aria-expanded={isOpen}
                  aria-controls={`p-${s.slug}`}
                  onClick={() => setOpen(isOpen ? "" : s.slug)}
                >
                  <span><small className="v2-acc__tag">{s.tag}</small>{s.name}</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M12 4v16" /></svg>
                </button>
              </h2>
              <div id={`p-${s.slug}`} className="v2-acc__panel" data-slug={s.slug} role="region" aria-label={s.name}>
                <div className="v2-acc__inner">
                  <div className="v2-acc__body">
                    <p><em>{s.promise}</em></p>
                    <p>{s.short}</p>
                    <TLink href={`/v2/services/${s.slug}`} className="v2-ul" label={s.name}>Read the full chapter</TLink>
                  </div>
                  <div>
                    <h3>Core capabilities</h3>
                    <ul role="list">{s.highlights.map((d) => <li key={d}>{d}</li>)}</ul>
                  </div>
                  <div>
                    <h3>Stack</h3>
                    <ul role="list">{s.stack.map((d) => <li key={d}>{d}</li>)}</ul>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="v2-sub__close">
        <h2>{pages.servicesPage.promisesTitle}</h2>
        <dl className="v2-promises">
          {promises.map((p) => (
            <div key={p.name}><dt>{p.name}</dt><dd>{p.body}</dd></div>
          ))}
        </dl>
        <TLink href="/v2/contact" className="v2-btn" label="Contact">{pages.hero.primary}</TLink>
      </section>
    </div>
  );
}
