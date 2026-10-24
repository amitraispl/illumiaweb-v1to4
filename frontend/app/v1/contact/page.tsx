"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Clock } from "@/components/motion/Clock";
import { onPageEnter } from "@/components/motion/onEnter";
import { magnetic, directionalFill } from "@/components/motion/effects";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { askedService, company, pages, services } from "@/lib/copy";

const budgets = pages.contact.budgets;

export default function BeaconContact() {
  const root = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  /* arriving from a service page preselects that service */
  useEffect(() => {
    const s = services.find((x) => x.slug === askedService());
    if (!s) return;
    const id = requestAnimationFrame(() => setPicked([s.name]));
    return () => cancelAnimationFrame(id);
  }, []);

  useGSAP(
    () => {
      const offs = [magnetic(root.current!, "[data-magnetic]"), directionalFill(root.current!, ".v1-btn")];
      if (reducedMotion()) return () => offs.forEach((f) => f());
      const split = SplitText.create(".v1-sub__title", { type: "chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 110 });
      gsap.set([".v1-form > *", ".v1-offices li"], { autoAlpha: 0, y: 30 });
      offs.push(
        onPageEnter("v1", () =>
          gsap
            .timeline()
            .to(split.chars, { yPercent: 0, stagger: 0.025, duration: 1, ease: ease.out })
            .to(".v1-form > *", { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.8, ease: ease.out }, 0.3)
            .to(".v1-offices li", { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.7, ease: ease.out }, 0.5),
        ),
      );
      return () => offs.forEach((f) => f());
    },
    { scope: root },
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: wire to Illumia's CRM / mail endpoint before launch.
    setSent(true);
    if (!reducedMotion()) gsap.from(".v1-sent", { autoAlpha: 0, y: 30, duration: 0.8, ease: ease.out });
  };

  const toggle = (s: string) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  return (
    <div ref={root} className="v1-page v1-sub">
      <header className="v1-sub__head">
        <p className="v1-eyebrow">{pages.contact.eyebrow}</p>
        <h1 className="v1-sub__title">{pages.contact.title}</h1>
        <p className="v1-sub__lede">
          {pages.contact.lede} Or write to <a className="v1-link" href={`mailto:${company.email}`}>{company.email}</a>.
        </p>
      </header>

      <div className="v1-contact">
        {sent ? (
          <div className="v1-sent" role="status">
            <h2>{pages.contact.thanks}</h2>
            <p>We will reply within one working day. For anything urgent, call {company.phone}.</p>
          </div>
        ) : (
          <form className="v1-form" onSubmit={submit}>
            <fieldset className="v1-field-group">
              <legend>{pages.contact.servicesQuestion}</legend>
              <div className="v1-chips v1-chips--pick">
                {services.map((s) => (
                  <button type="button" key={s.slug} aria-pressed={picked.includes(s.name)} onClick={() => toggle(s.name)}>
                    {s.name}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="v1-field">
              <span>Your name</span>
              <input name="name" required autoComplete="name" />
            </label>
            <label className="v1-field">
              <span>Work email</span>
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label className="v1-field">
              <span>Company</span>
              <input name="company" autoComplete="organization" />
            </label>
            <label className="v1-field">
              <span>Budget</span>
              <select name="budget" defaultValue="">
                <option value="" disabled>Choose a range</option>
                {budgets.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>
            <label className="v1-field v1-field--wide">
              <span>About the project</span>
              <textarea name="brief" rows={4} required placeholder={pages.contact.briefPlaceholder} />
            </label>
            <button className="v1-btn v1-btn--solid" data-magnetic type="submit"><span>Send the brief</span></button>
          </form>
        )}

        <aside className="v1-offices" aria-labelledby="v1-offices-title">
          <h2 id="v1-offices-title">{pages.contact.reachTitle}</h2>
          <ul role="list">
            {company.offices.map((o) => (
              <li key={o.country}>
                <span>{o.country}{o.hq ? " · HQ" : ""}</span>
                <Clock tz={o.tz} />
              </li>
            ))}
          </ul>
          <p><a href={company.phoneHref}>{company.phone}</a></p>
          <p><a href={`mailto:${company.email}`}>{company.email}</a></p>
          <address>{company.address.join(", ")}</address>
        </aside>
      </div>
    </div>
  );
}
