"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useTransition } from "@/components/motion/Transition";
import { timeIn } from "@/components/motion/effects";
import { LOOK, buildLog, company, process, services, stack } from "./content";
import { SHAPES, morph, shock, state, type Shape } from "./field";

type Line = { kind: "in" | "out" | "ok" | "err"; text: string };

const COMMANDS = ["help", "ls", "cat", "services", "process", "stack", "offices", "morph", "shapes", "ignite", "build", "theme", "open", "whoami", "clear", "sudo", "exit"];
const PAGES: Record<string, [string, string]> = {
  home: ["/v5", "Home"],
  services: ["/v5/services", "Services"],
  ...Object.fromEntries(services.map((s) => [s.slug, [`/v5/services/${s.slug}`, s.name] as [string, string]])),
  process: ["/v5/process", "Process"],
  contact: ["/v5/contact", "Contact"],
};

const HELP = [
  "help              this list",
  "ls                list the four services",
  "cat <service>     read one, e.g. cat mobile",
  "process           the seven-stage cycle",
  "stack             what we build with",
  "offices           live time in all six offices",
  "morph <shape>     rebuild the light: " + SHAPES.join(", "),
  "ignite            send a shockwave through the field",
  "build             push a sprint to staging",
  "theme             swap dark and light",
  "open <page>       home, services, " + services.map((s) => s.slug).join(", ") + ", process, contact",
  "clear             wipe the screen",
];

/* A real (small) shell. It reads the same content as the rest of the site and drives the light field. */
export function Terminal() {
  const { navigate } = useTransition();
  const [lines, setLines] = useState<Line[]>([
    { kind: "ok", text: "illumia shell 5.1 · type help, or try: cat mobile" },
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [busy, setBusy] = useState(false);
  const screen = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const el = screen.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const print = (...out: Line[]) => setLines((l) => [...l, ...out].slice(-80));
  const out = (text: string, kind: Line["kind"] = "out"): Line => ({ kind, text });

  const exec = (raw: string) => {
    const [cmd = "", ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ").toLowerCase();
    switch (cmd.toLowerCase()) {
      case "":
        return [];
      case "help":
        return HELP.map((h) => out(h));
      case "ls":
        return [out(services.map((s) => `${s.slug}/`).join("   "))];
      case "services":
        return services.map((s) => out(`${s.name.padEnd(28)} ${s.promise}`));
      case "cat": {
        const key = arg.replace(/\/$/, "");
        const s = services.find((x) => x.slug === key || x.name.toLowerCase().startsWith(key));
        if (!arg) return [out("cat: which one? try ls", "err")];
        if (!s) return [out(`cat: ${arg}: no such service. try ls`, "err")];
        morph(LOOK[s.slug], { dim: 0.95 });
        return [
          out(`${s.name} · ${s.promise}`, "ok"),
          out(s.short),
          ...s.highlights.map((h, i) => out(`  0${i + 1}  ${h}`)),
          out("stack: " + s.stack.join(", ")),
        ];
      }
      case "process":
        return [...process.map((p, i) => out(`0${i + 1}  ${p.name}`, i === 6 ? "ok" : "out")), out("↺  iterate feeds straight back into discover")];
      case "theme": {
        const next = state.light ? "dark" : "light";
        // the Shell owns the switch and its transition
        window.dispatchEvent(new CustomEvent("v5:theme"));
        return [out(`theme → ${next}`, "ok")];
      }
      case "stack":
        return [out(stack.join(" · "))];
      case "offices":
      case "time":
        return company.offices.map((o) => {
          const t = timeIn(o.tz);
          const h = Number(t.slice(0, 2));
          return out(`${o.city.padEnd(10)} ${t}   ${h >= 9 && h < 19 ? "● at their desks" : "○ on call"}`, h >= 9 && h < 19 ? "ok" : "out");
        });
      case "shapes":
        return [out(SHAPES.join("  "))];
      case "morph": {
        if (!SHAPES.includes(arg as Shape)) return [out(`morph: pick one of ${SHAPES.join(", ")}`, "err")];
        morph(arg as Shape, { dim: 0.95 });
        return [out(`rebuilding ${state0(arg)}… look behind this window`, "ok")];
      }
      case "ignite": {
        const r = screen.current?.getBoundingClientRect();
        shock(r ? r.left + r.width / 2 : innerWidth / 2, r ? r.top + r.height / 2 : innerHeight / 2);
        return [out("✦ shockwave sent", "ok")];
      }
      case "build": {
        setBusy(true);
        buildLog.forEach((l, i) => {
          timers.current.push(
            window.setTimeout(() => {
              print(out(l, l.startsWith("✓") ? "ok" : "out"));
              if (i === buildLog.length - 1) {
                setBusy(false);
                shock(innerWidth / 2, innerHeight / 2);
              }
            }, 260 * (i + 1)),
          );
        });
        return [];
      }
      case "open":
      case "cd": {
        const p = PAGES[arg.replace(/^\/|\/$/g, "")];
        if (!p) return [out(`open: try ${Object.keys(PAGES).join(", ")}`, "err")];
        navigate(p[0], p[1]);
        return [out(`opening ${p[1].toLowerCase()}…`, "ok")];
      }
      case "whoami":
        return [out("guest — probably scoping something. we should talk.")];
      case "sudo":
        return [out("permission granted: consult an expert → open contact", "ok")];
      case "exit":
        return [out("there is no exit. only the next sprint.")];
      case "clear":
        setLines([]);
        return [];
      default:
        return [out(`${cmd}: command not found. type help`, "err")];
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const v = value;
    setValue("");
    setCursor(-1);
    if (v.trim()) setHistory((h) => [v, ...h].slice(0, 30));
    const result = exec(v);
    if (v.trim().toLowerCase() !== "clear") print(out(v, "in"), ...result);
  };

  const key = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const c = Math.min(cursor + 1, history.length - 1);
      if (c >= 0) {
        setCursor(c);
        setValue(history[c]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const c = cursor - 1;
      setCursor(Math.max(c, -1));
      setValue(c >= 0 ? history[c] : "");
    } else if (e.key === "Tab") {
      const [head, ...rest] = value.split(" ");
      const pool = rest.length ? (head === "morph" ? [...SHAPES] : head === "cat" ? services.map((s) => s.slug) : head === "open" ? Object.keys(PAGES) : []) : COMMANDS;
      const part = rest.length ? rest.join(" ") : head;
      const hit = pool.find((c) => c.startsWith(part));
      if (hit && value) {
        e.preventDefault();
        setValue(rest.length ? `${head} ${hit}` : `${hit} `);
      }
    }
  };

  return (
    <div className="v5-term" data-cursor="type" onClick={() => input.current?.focus()}>
      <div className="v5-term__bar">
        <i /><i /><i />
        <b>guest@illumia: ~</b>
        <span>zsh</span>
      </div>
      <div ref={screen} className="v5-term__screen" data-lenis-prevent role="log" aria-live="polite" aria-label="Terminal output">
        {lines.map((l, i) => (
          <p key={i} className={`v5-term__l is-${l.kind}`}>
            {l.kind === "in" && <span className="v5-term__ps" aria-hidden="true">~ $</span>}
            {l.text}
          </p>
        ))}
      </div>
      <form className="v5-term__form" onSubmit={submit}>
        <label htmlFor="v5-term-in" className="v5-term__ps">~ $</label>
        <input
          id="v5-term-in"
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={key}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Type a command"
          placeholder={busy ? "building…" : "type help"}
        />
      </form>
      <div className="v5-term__chips" aria-label="Try a command">
        {["help", "ls", "cat mobile", "morph branches", "morph terrain", "build", "theme"].map((c) => (
          <button
            key={c}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (busy) return;
              print(out(c, "in"), ...exec(c));
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

const state0 = (s: string) => (s === "words" ? "the words" : `the ${s}`);
