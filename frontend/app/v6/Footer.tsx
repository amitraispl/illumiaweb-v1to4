"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { TLink } from "@/components/motion/Transition";
import { Clock } from "@/components/motion/Clock";
import { magnetic } from "@/components/motion/effects";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { company, pages, services } from "@/lib/copy";
import { zone } from "./flux";

/* The sign-off: ink rains down behind the biggest type on the site. */
export function Footer() {
  const root = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const off = magnetic(root.current!, "[data-magnetic]", 0.3);
      zone(root.current!, "rain", 0.9);
      if (reducedMotion()) return off;
      const split = SplitText.create(".v6-foot__big", { type: "chars", mask: "chars" });
      gsap.from(split.chars, {
        yPercent: 110, duration: 1.2, stagger: 0.035, ease: ease.out,
        scrollTrigger: { trigger: root.current, start: "top 65%" },
      });
      gsap.from(".v6-foot__cta, .v6-foot__grid > *, .v6-foot__clocks li", {
        y: 30, autoAlpha: 0, stagger: 0.05, duration: 0.9, ease: ease.out,
        scrollTrigger: { trigger: root.current, start: "top 50%" },
      });
      return off;
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <footer ref={root} className="v6-foot">
      <p className="v6-foot__big" aria-hidden="true">Let&rsquo;s flow.</p>
      <h2 className="v6-foot__ask">{pages.footer.ask}</h2>
      <TLink href="/v6/contact" className="v6-foot__cta v6-btn v6-btn--solid" data-magnetic label="Contact">
        <span>{pages.footer.cta}</span>
      </TLink>
      <ul className="v6-foot__clocks" role="list" aria-label="Office times">
        {company.offices.map((o) => (
          <li key={o.country}><span>{o.city}</span><Clock tz={o.tz} /></li>
        ))}
      </ul>
      <div className="v6-foot__grid">
        <div>
          <img className="v6-logo v6-logo--on-dark" src="/brand/illumia-logo-light.svg" alt="Illumia Solutions" width={150} height={40} />
          <img className="v6-logo v6-logo--on-light" src="/brand/illumia-logo-dark.svg" alt="Illumia Solutions" width={150} height={40} />
          <p className="v6-foot__tag">{company.tagline}</p>
          <p className="v6-foot__about">{pages.footer.about}</p>
        </div>
        <nav className="v6-foot__links" aria-label="Services">
          {services.map((s) => <TLink key={s.slug} href={`/v6/services/${s.slug}`} label={s.name}>{s.name}</TLink>)}
          <TLink href="/v6/process" label="Process">How we work</TLink>
        </nav>
        <div className="v6-foot__links">
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <a href={company.phoneHref}>{company.phone}</a>
          <a href={company.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <TLink href="/" label="Versions">All six versions</TLink>
        </div>
        <address>{company.address.map((l) => <span key={l}>{l}</span>)}</address>
      </div>
      <p className="v6-foot__legal">
        <span>{pages.footer.legal}</span>
        <span>↑ ↑ ↓ ↓ ← → ← → B A</span>
      </p>
    </footer>
  );
}
