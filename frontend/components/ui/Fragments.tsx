import type { Project } from "@/lib/content";
import s from "./fragments.module.css";

/*
 * Interface fragments: small, believable pieces of the software we build,
 * drawn in HTML. They stand in for photography on a software site.
 * Theme them per version with --fg, --bg, --panel, --line, --accent, --muted.
 */

function ErpCover() {
  const rows = [
    ["Kolkata DC", 1842, 92],
    ["Howrah 2", 1310, 71],
    ["Siliguri", 966, 54],
    ["Durgapur", 701, 38],
    ["Haldia port", 512, 27],
  ] as const;
  return (
    <div className={s.app} data-ui>
      <div className={s.bar}>
        <b>Stock by warehouse</b>
        <span className={s.pill}>Live</span>
      </div>
      <table className={s.table}>
        <thead>
          <tr><th>Warehouse</th><th>Units</th><th aria-label="Capacity" /></tr>
        </thead>
        <tbody>
          {rows.map(([w, u, p]) => (
            <tr key={w}>
              <td>{w}</td>
              <td className={s.num}>{u.toLocaleString("en-IN")}</td>
              <td><span className={s.meter}><i style={{ width: `${p}%` }} /></span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={s.foot}><span>Month-end close</span><b>Day 2 of 2</b></div>
    </div>
  );
}

function NetworkCover() {
  const nodes = [
    [50, 18], [20, 46], [80, 46], [12, 80], [36, 80], [64, 80], [88, 80],
  ] as const;
  const links = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [4, 5]] as const;
  return (
    <div className={s.app} data-ui>
      <div className={s.bar}>
        <b>core-kol-01 · topology</b>
        <span className={s.muted}>3,046 devices</span>
      </div>
      <svg className={s.graph} viewBox="0 0 100 100" aria-hidden="true">
        {links.map(([a, b]) => (
          <line key={`${a}${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />
        ))}
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 0 ? 5 : 3.2} className={i === 0 ? s.hot : undefined} />
        ))}
      </svg>
      <div className={s.foot}><span>Pending changes</span><b>2 awaiting approval</b></div>
    </div>
  );
}

function IntakeCover() {
  return (
    <div className={s.app} data-ui>
      <div className={s.bar}><b>Patient check-in</b><span className={s.muted}>Step 2 of 3</span></div>
      <div className={s.steps}><i className={s.on} /><i className={s.on} /><i /></div>
      <label className={s.field}><span>Full name</span><em>Ananya Sen</em></label>
      <label className={s.field}><span>Date of birth</span><em>14 / 03 / 1988</em></label>
      <label className={s.field}><span>Reason for visit</span><em>Follow-up, cardiology</em></label>
      <div className={s.button}>Continue</div>
    </div>
  );
}

function AssistantCover() {
  return (
    <div className={s.app} data-ui>
      <div className={s.bar}><b>Atlas · policy assistant</b><span className={s.pill}>Logged</span></div>
      <p className={s.q}>Can a branch approve a loan above ₹50 lakh?</p>
      <p className={s.a}>
        No. Loans above ₹50 lakh need regional credit committee approval, and the branch may only
        forward the file.
      </p>
      <div className={s.cites}><span>Credit Policy §4.2</span><span>Delegation Matrix p.7</span></div>
    </div>
  );
}

function MigrateCover() {
  const vms = [
    ["erp-db-01", 100],
    ["mail-02", 100],
    ["web-07", 64],
    ["ci-runner-3", 22],
    ["backup-01", 0],
  ] as const;
  return (
    <div className={s.app} data-ui>
      <div className={s.bar}><b>Migration wave 3</b><span className={s.muted}>VMware → Proxmox</span></div>
      <ul className={s.list}>
        {vms.map(([n, p]) => (
          <li key={n}>
            <span>{n}</span>
            <span className={s.meter}><i style={{ width: `${p}%` }} /></span>
            <b className={s.num}>{p === 100 ? "Done" : p === 0 ? "Queued" : `${p}%`}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FieldCover() {
  return (
    <div className={`${s.app} ${s.phone}`} data-ui>
      <div className={s.bar}><b>Job 2214</b><span className={s.pill}>Offline</span></div>
      <p className={s.a}>Replace feeder isolator, pole 118, Ward 9</p>
      <ul className={s.checks}>
        <li className={s.done}>Site made safe</li>
        <li className={s.done}>Photos taken (4)</li>
        <li>Customer signature</li>
      </ul>
      <div className={s.button}>Save · syncs when online</div>
    </div>
  );
}

const covers = {
  erp: ErpCover,
  network: NetworkCover,
  intake: IntakeCover,
  assistant: AssistantCover,
  migrate: MigrateCover,
  field: FieldCover,
};

export function ProjectCover({ kind }: { kind: Project["cover"] }) {
  const C = covers[kind];
  return <C />;
}

export function CodePane({ lines, title = "service.ts" }: { lines: string[]; title?: string }) {
  return (
    <div className={`${s.app} ${s.code}`} data-ui>
      <div className={s.bar}><b>{title}</b><span className={s.dots}><i /><i /><i /></span></div>
      <pre>
        <code>
          {lines.map((l, i) => (
            <span key={i} className={s.line}>
              <span className={s.ln}>{i + 1}</span>
              {l}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export const sampleCode = [
  "export async function deploy(release: Release) {",
  "  const plan = await audit(release);",
  "  if (plan.risk > threshold) return hold(plan);",
  "",
  "  for (const wave of [0.1, 0.5, 1]) {",
  "    await rollout(release, wave);",
  "    await watch(metrics, { minutes: 5 });",
  "  }",
  "  return { status: 'live', downtime: 0 };",
  "}",
];
