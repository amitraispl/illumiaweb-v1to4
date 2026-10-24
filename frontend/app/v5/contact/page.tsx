"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Clock } from "@/components/motion/Clock";
import { onPageEnter } from "@/components/motion/onEnter";
import { magnetic, directionalFill } from "@/components/motion/effects";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { company, services } from "../content";
import { face, morph, release, shock, zone } from "../field";
import { offices } from "../shapes";

const budgets = ["Under $25k", "$25k–75k", "$75k–200k", "$200k+", "Not sure yet"];
const STEPS = ["Scope", "Size", "You"];
const COMPILE = [
  "› parsing brief.json",
  "› matching services to a dedicated team",
  "› drafting a first sprint",
  "› routing to Kolkata HQ",
  "✓ brief compiled · reply within one working day",
];

/* The contact form compiles a brief: the JSON on the right is what we receive. */
export default function LumenContact() {
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [weeks, setWeeks] = useState(12);
  const [who, setWho] = useState({ name: "", email: "", company: "", brief: "" });
  const [phase, setPhase] = useState<"edit" | "compiling" | "sent">("edit");
  const [log, setLog] = useState<string[]>([]);

  /* a service page can send you here with that service already picked */
  useEffect(() => {
    const want = new URLSearchParams(location.search).get("service");
    const s = services.find((x) => x.slug === want);
    // read the URL once mounted, so the prerender and hydration agree
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (s) setPicked([s.name]);
  }, []);

  useGSAP(
    () => {
      const el = root.current!;
      zone(".v5-sub__head", "globe", { x: 0.45, scale: 0.85 }, { y: 0.4, scale: 0.7, dim: 0.5 });
      zone(".v5-brief", "nebula", { dim: 0.35, scale: 1.3 });
      zone(".v5-reach", "globe", { x: -0.45, scale: 0.85 }, { y: 0.45, scale: 0.7, dim: 0.5 });
      const offs = [magnetic(el, "[data-magnetic]"), directionalFill(el, ".v5-btn")];
      if (reducedMotion()) return () => offs.forEach((f) => f());
      const split = SplitText.create(".v5-sub__title", { type: "words,chars", charsClass: "ch" });
      gsap.set(split.chars, { yPercent: 90, rotateX: -95, autoAlpha: 0, transformOrigin: "50% 100% -40px" });
      gsap.set(".v5-sub__lede, .v5-sub__head .v5-eyebrow, .v5-brief > *", { autoAlpha: 0, y: 30 });
      offs.push(
        onPageEnter("v5", () =>
          gsap.timeline()
            .to(split.chars, { yPercent: 0, rotateX: 0, autoAlpha: 1, stagger: 0.03, duration: 1.2, ease: ease.out })
            .to(".v5-sub__lede, .v5-sub__head .v5-eyebrow", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: ease.out }, 0.4)
            .to(".v5-brief > *", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: ease.out }, 0.6),
        ),
      );
      gsap.from(".v5-reach__list li", {
        y: 30, autoAlpha: 0, stagger: 0.06, duration: 0.8, ease: ease.out,
        scrollTrigger: { trigger: ".v5-reach", start: "top 75%" },
      });
      return () => offs.forEach((f) => f());
    },
    { scope: root },
  );

  /* each step slides in from the side it came from */
  const go = (n: number) => {
    const dir = n > step ? 1 : -1;
    setStep(n);
    if (!reducedMotion()) {
      requestAnimationFrame(() =>
        gsap.fromTo(".v5-step > *", { x: 60 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.05, duration: 0.7, ease: ease.out }),
      );
    }
  };

  const toggle = (s: string) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) return go(step + 1);
    // TODO: wire to Illumia's CRM / mail endpoint before launch.
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    shock(r.left + r.width / 2, r.top + r.height / 2);
    if (reducedMotion()) {
      setLog(COMPILE);
      setPhase("sent");
      return;
    }
    setPhase("compiling");
    setLog([]);
    COMPILE.forEach((l, i) =>
      window.setTimeout(() => {
        setLog((x) => [...x, l]);
        if (i === COMPILE.length - 1) {
          setPhase("sent");
          morph("mark", { x: 0.45, scale: 0.9 }, 2);
        }
      }, 420 * (i + 1)),
    );
  };

  const json = {
    services: picked,
    budget: budget || null,
    timeline_weeks: weeks,
    contact: { name: who.name || null, email: who.email || null, company: who.company || null },
    brief: who.brief || null,
    route: "kolkata-hq",
  };

  return (
    <div ref={root} className="v5-page v5-sub">
      <header className="v5-sub__head">
        <p className="v5-eyebrow">Contact · consult an expert</p>
        <h1 className="v5-sub__title">Start a project</h1>
        <p className="v5-sub__lede">
          Three short steps. What you type compiles into the brief on the right, which is exactly what our
          engineers receive. An engineer replies within one working day, or write to{" "}
          <a className="v5-link" href={`mailto:${company.email}`}>{company.email}</a>.
        </p>
      </header>

      <section className="v5-brief" aria-label="Project brief">
        {phase === "sent" ? (
          <div className="v5-sent" role="status">
            <p className="v5-eyebrow">Brief received</p>
            <h2>Thank you{who.name ? `, ${who.name.split(" ")[0]}` : ""}. The light is on.</h2>
            <p>We will reply within one working day. For anything urgent, call <a href={company.phoneHref}>{company.phone}</a>.</p>
          </div>
        ) : (
          <form className="v5-form" onSubmit={submit} aria-describedby="v5-form-steps">
            <ol id="v5-form-steps" className="v5-form__steps" role="list">
              {STEPS.map((s, i) => (
                <li key={s}>
                  <button type="button" onClick={() => go(i)} aria-current={i === step ? "step" : undefined} className={i < step ? "is-done" : undefined}>
                    <span>0{i + 1}</span> {s}
                  </button>
                </li>
              ))}
            </ol>

            <div className="v5-step" key={step}>
              {step === 0 && (
                <fieldset>
                  <legend>Which services do you need? Pick any.</legend>
                  <div className="v5-chips v5-chips--pick">
                    {services.map((s) => (
                      <button type="button" key={s.slug} aria-pressed={picked.includes(s.name)} onClick={() => toggle(s.name)}>{s.name}</button>
                    ))}
                  </div>
                </fieldset>
              )}
              {step === 1 && (
                <>
                  <fieldset>
                    <legend>Budget</legend>
                    <div className="v5-chips v5-chips--pick">
                      {budgets.map((b) => (
                        <button type="button" key={b} aria-pressed={budget === b} onClick={() => setBudget(b)}>{b}</button>
                      ))}
                    </div>
                  </fieldset>
                  <label className="v5-range">
                    <span>Ideal timeline <output>{weeks} weeks</output></span>
                    <input type="range" min={2} max={52} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} style={{ ["--p" as string]: `${((weeks - 2) / 50) * 100}%` }} />
                  </label>
                </>
              )}
              {step === 2 && (
                <div className="v5-fields">
                  <label className="v5-field">
                    <span>Your name</span>
                    <input name="name" required autoComplete="name" value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value })} />
                  </label>
                  <label className="v5-field">
                    <span>Work email</span>
                    <input name="email" type="email" required autoComplete="email" value={who.email} onChange={(e) => setWho({ ...who, email: e.target.value })} />
                  </label>
                  <label className="v5-field">
                    <span>Company</span>
                    <input name="company" autoComplete="organization" value={who.company} onChange={(e) => setWho({ ...who, company: e.target.value })} />
                  </label>
                  <label className="v5-field v5-field--wide">
                    <span>About the project</span>
                    <textarea name="brief" rows={4} required placeholder="What should it do, and for whom?" value={who.brief} onChange={(e) => setWho({ ...who, brief: e.target.value })} />
                  </label>
                </div>
              )}
            </div>

            <div className="v5-form__nav">
              {step > 0 && <button type="button" className="v5-link" onClick={() => go(step - 1)}>Back</button>}
              <button className="v5-btn v5-btn--solid" data-magnetic type="submit" disabled={phase === "compiling"}>
                <span>{phase === "compiling" ? "Compiling…" : step < STEPS.length - 1 ? "Next" : "Compile and send"}</span>
              </button>
            </div>
          </form>
        )}

        <div className="v5-json" aria-label="Your brief as we will receive it">
          <div className="v5-term__bar"><i /><i /><i /><b>brief.json</b><span>{phase === "edit" ? "live" : phase}</span></div>
          <pre><code>{highlight(JSON.stringify(json, null, 2))}</code></pre>
          {log.length > 0 && (
            <div className="v5-json__log" role="status">
              {log.map((l) => <p key={l} className={l.startsWith("✓") ? "is-ok" : undefined}>{l}</p>)}
            </div>
          )}
        </div>
      </section>

      <section className="v5-reach" aria-labelledby="v5-reach-title">
        <div className="v5-reach__text">
          <h2 id="v5-reach-title">Six offices, one team</h2>
          <ul className="v5-reach__list" role="list">
            {offices.map((o) => (
              <li key={o.country}>
                <button type="button" onPointerEnter={() => face(o.lat, o.lon)} onFocus={() => face(o.lat, o.lon)} onPointerLeave={release} onBlur={release}>
                  <span>{o.city}<small>{o.country}{o.hq ? " · HQ" : ""}</small></span>
                  <Clock tz={o.tz} />
                </button>
              </li>
            ))}
          </ul>
          <p className="v5-reach__links">
            <a href={company.phoneHref} className="v5-link">{company.phone}</a>
            <a href={`mailto:${company.email}`} className="v5-link">{company.email}</a>
          </p>
          <address>{company.address.join(", ")}</address>
        </div>
      </section>
    </div>
  );
}

/* tiny JSON syntax colouring: keys, strings, numbers and nulls */
function highlight(src: string) {
  return src.split("\n").map((line, i) => {
    const parts = line.split(/("(?:[^"\\]|\\.)*"\s*:|"(?:[^"\\]|\\.)*"|\bnull\b|\b\d+\b)/g);
    return (
      <span key={i} className="v5-json__line">
        {parts.map((p, k) => {
          if (!p) return null;
          const cls = /:\s*$/.test(p) ? "k" : p.startsWith('"') ? "s" : p === "null" ? "n" : /^\d+$/.test(p) ? "d" : undefined;
          return cls ? <span key={k} className={`v5-json__${cls}`}>{p}</span> : p;
        })}
        {"\n"}
      </span>
    );
  });
}
