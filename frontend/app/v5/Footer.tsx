"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { TLink } from "@/components/motion/Transition";
import { Clock } from "@/components/motion/Clock";
import { magnetic } from "@/components/motion/effects";
import { gsap, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { company, services } from "./content";
import { zone } from "./field";

/* The sign-off: the light spells the invitation, the page answers with a button. */
export function Footer() {
  const root = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const off = magnetic(root.current!, "[data-magnetic]", 0.25);
      zone(root.current!, "words", { y: 0.42, scale: 1, dim: 1 }, { y: 0.45, scale: 0.5, dim: 0.9 });
      if (reducedMotion()) return off;
      gsap.from(".v5-foot__cta, .v5-foot__grid > *, .v5-foot__clocks li", {
        y: 40, autoAlpha: 0, stagger: 0.05, duration: 1, ease: ease.out,
        scrollTrigger: { trigger: root.current, start: "top 55%" },
      });
      return off;
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <footer ref={root} className="v5-foot">
      <h2 className="sr-only">Let&rsquo;s build</h2>
      <div className="v5-foot__stage" aria-hidden="true" />
      <p className="v5-foot__ask">Ready to get started?</p>
      <TLink href="/v5/contact" className="v5-foot__cta v5-btn v5-btn--solid" data-magnetic label="Contact">
        <span>Consult an expert</span>
        <i aria-hidden="true">→</i>
      </TLink>
      <ul className="v5-foot__clocks" role="list" aria-label="Office times">
        {company.offices.map((o) => (
          <li key={o.country}>
            <span>{o.city}</span>
            <Clock tz={o.tz} />
          </li>
        ))}
      </ul>
      <div className="v5-foot__grid">
        <div>
          <img className="v5-logo v5-logo--on-dark" src="/brand/illumia-logo-light.svg" alt="Illumia Solutions" width={150} height={40} />
          <img className="v5-logo v5-logo--on-light" src="/brand/illumia-logo-dark.svg" alt="Illumia Solutions" width={150} height={40} />
          <p className="v5-foot__tag">{company.tagline}</p>
          <p className="v5-foot__about">The software development wing of Illumia Solutions: design, mobile, web and integrations, by one accountable team.</p>
        </div>
        <nav className="v5-foot__links" aria-label="Services">
          <h3>Services</h3>
          {services.map((s) => (
            <TLink key={s.slug} href={`/v5/services/${s.slug}`} label={s.name}>{s.name}</TLink>
          ))}
          <TLink href="/v5/process" label="Process">How we work</TLink>
        </nav>
        <div className="v5-foot__links">
          <h3>Talk to us</h3>
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <a href={company.phoneHref}>{company.phone}</a>
          <a href={company.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={company.site} target="_blank" rel="noreferrer">illumiasolutions.com</a>
        </div>
        <div>
          <h3 className="v5-foot__h">Headquarters</h3>
          <address>{company.address.map((l) => <span key={l}>{l}</span>)}</address>
        </div>
      </div>
      <p className="v5-foot__legal">
        <span>© 2026 Illumia Solutions Pvt. Ltd. · Software Development</span>
        <TLink href="/" label="Versions">All versions</TLink>
        <span>Press <kbd>Ctrl</kbd> <kbd>K</kbd> anywhere</span>
      </p>
    </footer>
  );
}
