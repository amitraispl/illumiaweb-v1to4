"use client";

import { useRef } from "react";
import { TLink } from "@/components/motion/Transition";
import { Clock } from "@/components/motion/Clock";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { company, pages, services } from "@/lib/copy";

/* The sign-off: a giant line that a beam of light sweeps across. */
export function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const split = SplitText.create(".v1-foot__big", { type: "chars", mask: "chars" });
      gsap.from(split.chars, {
        yPercent: 100, duration: 1.1, stagger: 0.03, ease: ease.out,
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
      gsap.fromTo(".v1-foot__beam", { xPercent: -120 }, { xPercent: 220, duration: 3.6, ease: "power1.inOut", repeat: -1, repeatDelay: 1.4 });
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="v1-foot">
      <p className="v1-foot__ask">{pages.footer.ask}</p>
      <TLink href="/v1/contact" className="v1-foot__cta" label="Contact" data-cursor="view">
        <span className="v1-foot__big">Let&rsquo;s build</span>
        <span className="v1-foot__beam" aria-hidden="true" />
      </TLink>
      <div className="v1-foot__grid">
        <div>
          <img src="/brand/illumia-logo-light.svg" alt="Illumia Solutions" width={160} height={44} />
          <p className="v1-foot__tag">{company.tagline}</p>
          <p className="v1-foot__about">{pages.footer.about}</p>
        </div>
        <nav className="v1-foot__links" aria-label="Services">
          {services.map((s) => <TLink key={s.slug} href={`/v1/services/${s.slug}`} label={s.name}>{s.name}</TLink>)}
          <TLink href="/v1/process" label="Process">How we work</TLink>
        </nav>
        <div className="v1-foot__links">
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <a href={company.phoneHref}>{company.phone}</a>
          <a href={company.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <p>Kolkata <Clock tz="Asia/Kolkata" /></p>
          <address>{company.address.map((l) => <span key={l}>{l}</span>)}</address>
        </div>
      </div>
      <p className="v1-foot__legal">{pages.footer.legal}</p>
    </footer>
  );
}
