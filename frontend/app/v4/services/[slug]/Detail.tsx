"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { promises, serviceBySlug, services } from "@/lib/copy";

/* One service as a set of drawings: each capability group is a room whose plate opens from its centre line. */
export function Detail({ slug }: { slug: string }) {
  const root = useRef<HTMLDivElement>(null);
  const s = serviceBySlug(slug)!;
  const i = services.indexOf(s);
  const next = services[(i + 1) % services.length];

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v4-sub__title", { type: "lines", mask: "lines" });
      gsap.set(t.lines, { yPercent: 100 });
      gsap.set(".v4-sub__head .v4-room__line, .v4-sub__lede, .v4-sub__actions", { autoAlpha: 0, y: 24 });
      const off = onPageEnter("v4", () =>
        gsap
          .timeline()
          .to(t.lines, { yPercent: 0, duration: 1.4, stagger: 0.1, ease: ease.out })
          .to(".v4-sub__head .v4-room__line, .v4-sub__lede, .v4-sub__actions", { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.1, ease: ease.out }, 0.5),
      );
      gsap.utils.toArray<HTMLElement>(".v4-room").forEach((r) => {
        gsap.fromTo(r.querySelector(".v4-room__plate"), { clipPath: "inset(0 50% 0 50%)" }, {
          clipPath: "inset(0 0% 0 0%)", duration: 1.6, ease: ease.wipe, scrollTrigger: { trigger: r, start: "top 80%" },
        });
        gsap.from(r.querySelectorAll(".v4-room__text > *"), {
          y: 30, autoAlpha: 0, stagger: 0.1, duration: 1.2, ease: ease.out, scrollTrigger: { trigger: r, start: "top 70%" },
        });
      });
      return off;
    },
    { scope: root, dependencies: [slug], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="v4-page v4-sub">
      <header className="v4-sub__head">
        <p className="v4-room__line"><em>{s.tag} · {i + 1} of {services.length} · Software Development</em></p>
        <h1 className="v4-sub__title">{s.name}, <em>{s.promise.replace(/\.$/, "")}</em></h1>
        <p className="v4-sub__lede">{s.lede}</p>
        <div className="v4-sub__actions">
          <TLink href={`/v4/contact?service=${s.slug}`} className="v4-btn" label="Contact">{s.cta}</TLink>
          <TLink href="/v4/services" className="v4-link" label="Services">All services</TLink>
        </div>
      </header>

      <h2 className="sr-only">Our {s.tag.toLowerCase()} capabilities</h2>
      {s.groups.map((g, k) => (
        <section key={g.name} className="v4-room" aria-labelledby={`r-g-${k}`}>
          <div className="v4-room__plate">
            <p className="v4-room__name" aria-hidden="true">{String(k + 1).padStart(2, "0")}</p>
            <ul role="list">{g.items.map((c) => <li key={c.title}>{c.title}</li>)}</ul>
          </div>
          <div className="v4-room__text">
            <p className="v4-room__line"><em>Drawing {k + 1} of {s.groups.length}</em></p>
            <h2 id={`r-g-${k}`}>{g.name}</h2>
            {g.items.map((c) => (
              <div key={c.title} className="v4-cap">
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="v4-sub__close">
        <h2><em>{s.closing}</em></h2>
        <dl className="v4-promises">
          {promises.map((p) => <div key={p.name}><dt><em>{p.name}</em></dt><dd>{p.body}</dd></div>)}
        </dl>
      </section>

      <section className="v4-next" aria-label="Next service">
        <TLink href={`/v4/services/${next.slug}`} label={next.name} className="v4-next__link">
          <small>Next · {next.tag}</small>
          <b>{next.name}</b>
          <em>{next.promise}</em>
        </TLink>
      </section>
    </div>
  );
}
