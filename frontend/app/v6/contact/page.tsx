"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Clock } from "@/components/motion/Clock";
import { onPageEnter } from "@/components/motion/onEnter";
import { gsap, SplitText, useGSAP, ease, reducedMotion } from "@/lib/gsap";
import { askedService, company, pages, services } from "@/lib/copy";
import { burst, zone } from "../flux";
import { blip, chime } from "../sound";

type Msg = { from: "bot" | "you"; text: string };
type Step = { key: string; ask: (a: Record<string, string>) => string; chips?: string[]; multi?: boolean; input?: "text" | "email" | "long"; optional?: boolean };

const STEPS: Step[] = [
  { key: "name", ask: () => "Hi, I'm the Illumia brief bot. A real engineer reads everything I collect. What should we call you?", input: "text" },
  { key: "need", ask: (a) => `Good to meet you, ${a.name.split(" ")[0]}. ${pages.contact.servicesQuestion}`, chips: services.map((s) => s.name), multi: true },
  { key: "budget", ask: () => "Roughly what budget are you working with?", chips: pages.contact.budgets },
  { key: "when", ask: () => "And when would you like it live?", chips: ["This quarter", "In 3–6 months", "Later this year", "Just exploring"] },
  { key: "brief", ask: () => `Tell me about it in a sentence or two. ${pages.contact.briefPlaceholder}`, input: "long" },
  { key: "email", ask: () => "Last one: which work email should the engineer reply to?", input: "email" },
];

/* The contact form is a conversation. Each answer drips ink; the last one sends the brief. */
export default function FluxContact() {
  const root = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [typing, setTyping] = useState(false);
  const [value, setValue] = useState("");
  const [multi, setMulti] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  const bot = (text: string, wait = 700) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "bot", text }]);
      blip(1);
    }, reducedMotion() ? 0 : wait);
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    bot(STEPS[0].ask({}), 1100);
    // arriving from a service page: that service is already ticked when the question comes
    const s = services.find((x) => x.slug === askedService());
    if (s) window.setTimeout(() => setMulti([s.name]), 0);
  }, []);

  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [msgs, typing]);

  useGSAP(
    () => {
      zone(".v6-sub__head", "calm", 0.6);
      zone(".v6-chat", "calm", 0.3);
      zone(".v6-reach", "jets", 0.5);
      if (reducedMotion()) return;
      const split = SplitText.create(".v6-sub__title", { type: "words,chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 120, skewY: 12 });
      gsap.set(".v6-sub__lede, .v6-sub__head .v6-eyebrow, .v6-chat", { autoAlpha: 0, y: 40 });
      return onPageEnter("v6", () =>
        gsap.timeline()
          .to(split.chars, { yPercent: 0, skewY: 0, stagger: 0.03, duration: 1.2, ease: ease.out })
          .to(".v6-sub__lede, .v6-sub__head .v6-eyebrow", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: ease.out }, 0.4)
          .to(".v6-chat", { autoAlpha: 1, y: 0, duration: 1.1, ease: ease.out }, 0.5),
      );
    },
    { scope: root },
  );

  const answer = (text: string, from?: HTMLElement | null) => {
    const s = STEPS[step];
    const next = { ...answers, [s.key]: text };
    setAnswers(next);
    setMsgs((m) => [...m, { from: "you", text }]);
    setValue("");
    // keep a preselected service ticked until its question has been answered
    if (STEPS[step + 1]?.key !== "need") setMulti([]);
    const r = (from ?? log.current)?.getBoundingClientRect();
    if (r) burst(r.left + r.width / 2, r.top + r.height / 2, 8, 24, 0.6);
    if (step + 1 < STEPS.length) {
      setStep(step + 1);
      bot(STEPS[step + 1].ask(next));
    } else {
      // TODO: wire to Illumia's CRM / mail endpoint before launch.
      setStep(STEPS.length);
      bot(`Thank you, ${next.name.split(" ")[0]}. Your brief is on its way to Kolkata HQ. An engineer will reply to ${next.email} within one working day.`, 900);
      window.setTimeout(() => {
        setDone(true);
        chime();
        burst(window.innerWidth / 2, window.innerHeight / 2, 40, 110, 1.1);
      }, reducedMotion() ? 0 : 1100);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const s = STEPS[step];
    if (!s) return;
    if (s.multi) {
      if (multi.length) answer(multi.join(", "), e.currentTarget as HTMLElement);
      return;
    }
    const v = value.trim();
    if (!v) return;
    if (s.input === "email" && !/^\S+@\S+\.\S+$/.test(v)) {
      bot("That doesn't look like an email address. Could you check it?", 400);
      return;
    }
    answer(v, e.currentTarget as HTMLElement);
  };

  const s = STEPS[step];

  return (
    <div ref={root} className="v6-page v6-sub">
      <header className="v6-sub__head">
        <p className="v6-eyebrow">{pages.contact.eyebrow} · about two minutes</p>
        <h1 className="v6-sub__title">{pages.contact.title}</h1>
        <p className="v6-sub__lede">
          Six quick questions, no form to fight with. {pages.contact.lede} Or write to{" "}
          <a className="v6-link" href={`mailto:${company.email}`}>{company.email}</a>.
        </p>
      </header>

      <section className="v6-chat" aria-label="Project brief conversation">
        <div className="v6-chat__bar">
          <img src="/brand/illumia-mark.svg" alt="" width={28} height={28} />
          <b>Illumia brief</b>
          <span>{done ? "sent" : typing ? "typing…" : "online"}</span>
          <span className="v6-chat__progress" aria-label={`Question ${Math.min(step + 1, STEPS.length)} of ${STEPS.length}`}>
            <i style={{ transform: `scaleX(${Math.min(step, STEPS.length) / STEPS.length})` }} />
          </span>
        </div>
        <div ref={log} className="v6-chat__log" role="log" aria-live="polite" data-lenis-prevent>
          {msgs.map((m, i) => (
            <p key={i} className={`v6-msg is-${m.from}`}>{m.text}</p>
          ))}
          {typing && <p className="v6-msg is-bot is-typing" aria-label="Typing"><i /><i /><i /></p>}
        </div>

        {s && !done && !typing && (
          <form className="v6-chat__reply" onSubmit={submit}>
            {s.chips && (
              <div className="v6-chips v6-chips--pick" role="group" aria-label="Choose an answer">
                {s.chips.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={s.multi ? multi.includes(c) : undefined}
                    onClick={(e) => (s.multi ? setMulti((m) => (m.includes(c) ? m.filter((x) => x !== c) : [...m, c])) : answer(c, e.currentTarget))}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {s.input && (
              s.input === "long" ? (
                <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} aria-label="Your answer" placeholder="Type your answer…" autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} />
              ) : (
                <input value={value} onChange={(e) => setValue(e.target.value)} type={s.input} aria-label="Your answer" placeholder="Type your answer…" autoFocus
                  autoComplete={s.input === "email" ? "email" : s.key === "name" ? "name" : "off"} />
              )
            )}
            {(s.input || s.multi) && (
              <button type="submit" className="v6-btn v6-btn--solid" disabled={s.multi ? !multi.length : !value.trim()}>
                <span>{step === STEPS.length - 1 ? "Send brief" : "Send"}</span>
              </button>
            )}
          </form>
        )}
      </section>

      <section className="v6-reach" aria-labelledby="v6-reach-title">
        <h2 id="v6-reach-title">{pages.contact.reachTitle}</h2>
        <ul role="list">
          {company.offices.map((o) => (
            <li key={o.country}><span>{o.city}<small>{o.country}{o.hq ? " · HQ" : ""}</small></span><Clock tz={o.tz} /></li>
          ))}
        </ul>
        <p><a className="v6-link" href={company.phoneHref}>{company.phone}</a> · <a className="v6-link" href={`mailto:${company.email}`}>{company.email}</a></p>
        <address>{company.address.join(", ")}</address>
      </section>
    </div>
  );
}
