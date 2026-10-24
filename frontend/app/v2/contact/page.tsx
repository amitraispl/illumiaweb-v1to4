"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Clock } from "@/components/motion/Clock";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { askedService, company, pages, services } from "@/lib/copy";

/* A letter you fill in: the brief reads as a sentence with blanks. */
export default function EditorialContact() {
  const root = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  const [svc, setSvc] = useState("");

  /* arriving from a service chapter fills in that blank */
  useEffect(() => {
    const s = services.find((x) => x.slug === askedService());
    if (!s) return;
    const id = requestAnimationFrame(() => setSvc(s.name.toLowerCase()));
    return () => cancelAnimationFrame(id);
  }, []);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v2-sub__title", { type: "chars", mask: "chars", charsClass: "ch" });
      gsap.set(t.chars, { yPercent: 105 });
      gsap.set([".v2-letter", ".v2-desk > *"], { autoAlpha: 0, y: 30 });
      return onPageEnter("v2", () =>
        gsap
          .timeline()
          .to(t.chars, { yPercent: 0, stagger: 0.04, duration: 1.1, ease: ease.out })
          .to([".v2-letter", ".v2-desk > *"], { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.9, ease: ease.out }, 0.35),
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
    <div ref={root} className="v2-page v2-sub">
      <header className="v2-sub__head">
        <h1 className="v2-sub__title">Write <em>to us</em></h1>
        <p className="v2-sub__lede">
          {pages.contact.lede} Or write to <a className="v2-ul" href={`mailto:${company.email}`}>{company.email}</a>.
        </p>
      </header>

      <div className="v2-contact">
        {sent ? (
          <div className="v2-letter" role="status">
            <p className="v2-letter__text">Thank you. An engineer will answer within one working day.</p>
          </div>
        ) : (
          <form className="v2-letter" onSubmit={submit}>
            <p className="v2-letter__text">
              Hello Illumia, my name is{" "}
              <label><span className="sr-only">Your name</span><input name="name" required placeholder="your name" autoComplete="name" /></label>{" "}
              from{" "}
              <label><span className="sr-only">Company</span><input name="company" placeholder="company" autoComplete="organization" /></label>.
              We need help with{" "}
              <label>
                <span className="sr-only">Service</span>
                <select name="service" value={svc} onChange={(e) => setSvc(e.target.value)}>
                  <option value="" disabled>choose a service</option>
                  {services.map((s) => <option key={s.slug}>{s.name.toLowerCase()}</option>)}
                </select>
              </label>
              . You can reach me at{" "}
              <label><span className="sr-only">Email</span><input name="email" type="email" required placeholder="email address" autoComplete="email" /></label>.
            </p>
            <label className="v2-letter__more">
              <span>Anything else we should know</span>
              <textarea name="brief" rows={3} />
            </label>
            <button className="v2-btn" type="submit">Send the letter</button>
          </form>
        )}

        <aside className="v2-desk" aria-label="Offices">
          <h2>{pages.contact.reachTitle}</h2>
          <ul role="list">
            {company.offices.map((o) => (
              <li key={o.country}><span>{o.country}</span><Clock tz={o.tz} /></li>
            ))}
          </ul>
          <p><a className="v2-ul" href={company.phoneHref}>{company.phone}</a></p>
          <p><a className="v2-ul" href={`mailto:${company.email}`}>{company.email}</a></p>
          <address>{company.address.join(", ")}</address>
        </aside>
      </div>
    </div>
  );
}
