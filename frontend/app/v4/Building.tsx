/*
 * The building: a system drawn as an isometric stack of floors, one per service.
 * Integrations are the foundation everything plugs into; design is the facade on top.
 * Pure SVG so it can be drawn stroke by stroke and lit floor by floor.
 */

import { services } from "@/lib/copy";

/* foundation first: the order the floors are drawn, bottom to top */
const ORDER = ["integrations", "web", "mobile", "design"];
const ROLE = ["The foundation", "The structure", "The working floors", "The facade"];

export const floors = ORDER.map((slug, i) => {
  const s = services.find((x) => x.slug === slug)!;
  return { key: s.slug, name: s.name, line: `${ROLE[i]} · ${s.promise}`, body: s.short };
});

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
    <svg className={className} viewBox="0 0 400 420" role="img" aria-label="A system drawn as a four-floor building: integrations at the base, then web, mobile, and design on top">
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
