"use client";

import { useRef, useState, type FormEvent } from "react";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { company, services } from "@/lib/content";

const budgets = ["Under $25k", "$25k–75k", "$75k–200k", "$200k+", "Not sure yet"];
const timelines = ["This month", "This quarter", "Later this year", "Just exploring"];
const steps = ["What", "When", "Who"] as const;

/* A three-step brief: each step slides in sideways, the bar fills as you go. */
export default function KineticContact() {
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ service: "", budget: "", when: "" });
  const [sent, setSent] = useState(false);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const t = SplitText.create(".v3-sub__title", { type: "words,chars", charsClass: "k" });
      gsap.set(t.chars, { "--w": 62, yPercent: 100, autoAlpha: 0 });
      gsap.set(".v3-brief", { autoAlpha: 0, y: 40 });
      return onPageEnter("v3", () =>
        gsap
          .timeline()
          .to(t.chars, { yPercent: 0, autoAlpha: 1, "--w": 125, duration: 1, stagger: 0.03, ease: ease.out })
          .to(".v3-brief", { autoAlpha: 1, y: 0, duration: 0.9, ease: ease.out }, 0.35),
      );
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo(".v3-brief__step", { xPercent: 12, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.7, ease: ease.out });
      gsap.to(".v3-brief__bar i", { scaleX: (step + 1) / steps.length, duration: 0.8, ease: ease.out });
    },
    { scope: root, dependencies: [step, sent] },
  );

  const pick = (k: keyof typeof data, v: string) => setData((d) => ({ ...d, [k]: v }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step < steps.length - 1) return setStep((s) => s + 1);
    // TODO: post to Illumia's enquiry endpoint before launch.
    setSent(true);
  };

  return (
    <div ref={root} className="v3-page v3-sub">
      <header className="v3-sub__head">
        <h1 className="v3-sub__title">Let&rsquo;s talk</h1>
        <p className="v3-sub__lede">
          Three quick steps. Or call <a href={company.phoneHref} className="v3-u">{company.phone}</a>.
        </p>
      </header>

      <form className="v3-brief" onSubmit={submit} aria-live="polite">
        <div className="v3-brief__top">
          <ol className="v3-brief__steps">
            {steps.map((s, i) => (
              <li key={s} aria-current={i === step ? "step" : undefined} data-done={i < step}>{s}</li>
            ))}
          </ol>
          <div className="v3-brief__bar" aria-hidden="true"><i /></div>
        </div>

        {sent ? (
          <div className="v3-brief__step" role="status">
            <h2>Brief received</h2>
            <p>Thank you. An engineer will reply within one working day.</p>
          </div>
        ) : step === 0 ? (
          <fieldset className="v3-brief__step">
            <legend>What do you need built?</legend>
            <div className="v3-choices">
              {services.map((s) => (
                <label key={s.slug} className="v3-choice">
                  <input type="radio" name="service" value={s.name} checked={data.service === s.name} onChange={() => pick("service", s.name)} required />
                  <span>{s.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : step === 1 ? (
          <fieldset className="v3-brief__step">
            <legend>Budget and timing</legend>
            <div className="v3-choices">
              {budgets.map((b) => (
                <label key={b} className="v3-choice">
                  <input type="radio" name="budget" value={b} checked={data.budget === b} onChange={() => pick("budget", b)} required />
                  <span>{b}</span>
                </label>
              ))}
            </div>
            <div className="v3-choices">
              {timelines.map((b) => (
                <label key={b} className="v3-choice v3-choice--sm">
                  <input type="radio" name="when" value={b} checked={data.when === b} onChange={() => pick("when", b)} />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <fieldset className="v3-brief__step">
            <legend>Who should we reply to?</legend>
            <div className="v3-fields">
              <label><span>Name</span><input name="name" required autoComplete="name" /></label>
              <label><span>Work email</span><input name="email" type="email" required autoComplete="email" /></label>
              <label className="v3-fields__wide"><span>Anything else</span><textarea name="brief" rows={3} /></label>
            </div>
          </fieldset>
        )}

        {!sent && (
          <div className="v3-brief__nav">
            {step > 0 && <button type="button" className="v3-pill" onClick={() => setStep((s) => s - 1)}>Back</button>}
            <button type="submit" className="v3-blob">{step < steps.length - 1 ? "Next" : "Send brief"}</button>
          </div>
        )}
      </form>
    </div>
  );
}
