"use client";

import { useEffect, useState } from "react";
import { company } from "@/lib/content";

/*
 * The live thing: shows how many of the visitor's working hours (9–18 local)
 * overlap with each Illumia office's working hours, using their real timezone.
 */

const offsetHours = (tz: string, at: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" }).formatToParts(at);
  const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = name.match(/GMT([+-])(\d+)(?::(\d+))?/);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) + Number(m[3] ?? 0) / 60);
};

/* hours (0–24, in the visitor's day) when an office is between 9:00 and 18:00 */
function officeWindow(officeTz: string, mineTz: string, at: Date) {
  const shift = offsetHours(mineTz, at) - offsetHours(officeTz, at);
  return [9 + shift, 18 + shift];
}

function overlap(a: number[], b: number[]) {
  // compare across yesterday/today/tomorrow so windows that wrap midnight still count
  let best = 0;
  for (const k of [-24, 0, 24]) best = Math.max(best, Math.min(a[1], b[1] + k) - Math.max(a[0], b[0] + k));
  return Math.max(0, best);
}

export function Overlap() {
  const [tz, setTz] = useState<string | null>(null);
  const [at, setAt] = useState<Date | null>(null);

  useEffect(() => {
    // read the visitor's timezone once, client-side
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setAt(new Date());
  }, []);

  const mine = [9, 18];
  const rows = company.offices.map((o) => {
    const win = tz && at ? officeWindow(o.tz, tz, at) : [9, 18];
    const hrs = tz && at ? overlap(mine, win) : null;
    // draw the office window inside the visitor's 24h day
    const s = ((win[0] % 24) + 24) % 24;
    return { o, hrs, start: s, len: 9 };
  });
  const best = rows.reduce((a, b) => ((b.hrs ?? 0) > (a.hrs ?? 0) ? b : a), rows[0]);

  return (
    <div className="v4-overlap">
      <p className="v4-overlap__you">
        {tz ? (
          <>Your timezone looks like <b>{tz.replace(/_/g, " ")}</b>. Our {best.o.country} office shares <b>{best.hrs?.toFixed(0)} of your working hours</b>.</>
        ) : (
          <>Working hours shown against a 9 to 6 day.</>
        )}
      </p>
      <ul role="list" className="v4-overlap__list">
        {rows.map(({ o, hrs, start, len }) => (
          <li key={o.country}>
            <span className="v4-overlap__name">{o.country}{o.hq ? ", HQ" : ""}</span>
            <span className="v4-overlap__day" aria-hidden="true">
              <i className="v4-overlap__mine" style={{ left: `${(9 / 24) * 100}%`, width: `${(9 / 24) * 100}%` }} />
              <i className="v4-overlap__them" style={{ left: `${(start / 24) * 100}%`, width: `${(Math.min(len, 24 - start) / 24) * 100}%` }} />
              {start + len > 24 && <i className="v4-overlap__them" style={{ left: 0, width: `${((start + len - 24) / 24) * 100}%` }} />}
            </span>
            <span className="v4-overlap__hrs">{hrs === null ? "" : `${hrs.toFixed(0)} h overlap`}</span>
          </li>
        ))}
      </ul>
      <p className="v4-overlap__key"><i className="v4-overlap__mine" /> Your 9 to 6 <i className="v4-overlap__them" /> Office 9 to 6</p>
    </div>
  );
}
