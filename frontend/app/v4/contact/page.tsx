"use client";

import { useRef, useState, type FormEvent } from "react";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { company, services } from "@/lib/content";
import { Overlap } from "../Overlap";

export default function BlueprintContact() {
  const root = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v4-sub__title", { type: "lines", mask: "lines", linesClass: "ln" });
      gsap.set(t.lines, { yPercent: 105 });
      gsap.set([".v4-enquire > *", ".v4-contact__side > *"], { autoAlpha: 0, y: 24 });
      return onPageEnter("v4", () =>
        gsap
          .timeline()
          .to(t.lines, { yPercent: 0, duration: 1.4, stagger: 0.1, ease: ease.out })
          .to([".v4-enquire > *", ".v4-contact__side > *"], { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06, ease: ease.out }, 0.4),
      );
    },
    { scope: root },
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: connect to Illumia's enquiry endpoint before launch.
    setSent(true);
  };

  return (
    <div ref={root} className="v4-page v4-sub">
      <header className="v4-sub__head">
        <h1 className="v4-sub__title">Plan <em>your</em> build</h1>
      </header>
      <div className="v4-contact">
        {sent ? (
          <p className="v4-begin__done" role="status">Thank you. An engineer will reply within one working day.</p>
        ) : (
          <form className="v4-enquire" onSubmit={submit}>
            <label><span>Name</span><input name="name" required autoComplete="name" /></label>
            <label><span>Company</span><input name="company" autoComplete="organization" /></label>
            <label><span>Work email</span><input name="email" type="email" required autoComplete="email" /></label>
            <label><span>Phone</span><input name="phone" type="tel" autoComplete="tel" /></label>
            <label className="v4-enquire__wide">
              <span>Practice</span>
              <select name="service" defaultValue="">
                <option value="" disabled>Choose one</option>
                {services.map((s) => <option key={s.slug}>{s.name}</option>)}
              </select>
            </label>
            <label className="v4-enquire__wide"><span>What should it do?</span><textarea name="brief" rows={4} required /></label>
            <button className="v4-btn" type="submit">Send enquiry</button>
          </form>
        )}
        <aside className="v4-contact__side" aria-label="Headquarters">
          <h2>Headquarters</h2>
          <address>{company.address.map((l) => <span key={l}>{l}</span>)}</address>
          <a className="v4-link" href={company.phoneHref}>{company.phone}</a>
          <Overlap />
        </aside>
      </div>
    </div>
  );
}
