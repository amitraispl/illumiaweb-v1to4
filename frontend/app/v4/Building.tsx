/*
 * The building: a system drawn as an isometric stack of floors.
 * Security is the foundation, the interface is the roof.
 * Pure SVG so it can be drawn stroke by stroke and lit floor by floor.
 */

export const floors = [
  { key: "security", name: "Security", line: "The foundation", body: "Identity, secrets, threat models and audit trails, poured first so everything above stands on them." },
  { key: "infra", name: "Infrastructure", line: "The structure", body: "Proxmox or public cloud, Kubernetes and code-defined networks, documented in NetBox." },
  { key: "data", name: "Data", line: "The services floor", body: "PostgreSQL, queues and pipelines, modelled so reports agree with each other." },
  { key: "api", name: "Services and APIs", line: "The working floors", body: "The business logic: ERPNext modules, integrations, AI assistants with a human in the loop." },
  { key: "ui", name: "Interface", line: "The facade", body: "What people touch: web, mobile and the screens your team lives in all day." },
] as const;

const W = 150; // half-width of a slab
const D = W / 2; // half-depth (2:1 isometric)
const T = 22; // slab thickness
const GAP = 50;
const CX = 200;
const BASE = 330;

function slab(i: number) {
  const y = BASE - i * GAP;
  const top = `M${CX} ${y - D} L${CX + W} ${y} L${CX} ${y + D} L${CX - W} ${y} Z`;
  const left = `M${CX - W} ${y} L${CX} ${y + D} L${CX} ${y + D + T} L${CX - W} ${y + T} Z`;
  const right = `M${CX} ${y + D} L${CX + W} ${y} L${CX + W} ${y + T} L${CX} ${y + D + T} Z`;
  // a grid etched into the top face
  const grid: string[] = [];
  for (let k = 1; k < 4; k++) {
    const f = k / 4;
    grid.push(`M${CX - W + W * f} ${y - D * f} L${CX + W * f} ${y + D - D * f}`);
    grid.push(`M${CX + W - W * f} ${y - D * f} L${CX - W * f} ${y + D - D * f}`);
  }
  return { top, left, right, grid: grid.join(" "), y };
}

export function Building({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 420" role="img" aria-label="A system drawn as a five-floor building, security at the base and the interface on top">
      {/* columns tying the floors together */}
      <g className="b-cols">
        {[[CX - W, 0], [CX, D], [CX + W, 0]].map(([x, dy], i) => (
          <path key={i} d={`M${x} ${BASE + dy + T} L${x} ${BASE - (floors.length - 1) * GAP + dy}`} />
        ))}
      </g>
      {floors.map((f, i) => {
        const s = slab(i);
        return (
          <g key={f.key} className="b-floor" data-floor={i}>
            <path className="b-side b-left" d={s.left} />
            <path className="b-side b-right" d={s.right} />
            <path className="b-top" d={s.top} />
            <path className="b-grid" d={s.grid} />
          </g>
        );
      })}
    </svg>
  );
}
