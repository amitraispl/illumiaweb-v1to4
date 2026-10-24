/*
 * Point clouds the light field can become. Each returns `n` xyz triples in a
 * roughly [-1.6, 1.6] box, centred on the origin, camera looking down -z.
 */

import { company } from "@/lib/content";
import type { Shape } from "./field";

type Rand = () => number;

/** Small seeded PRNG so every visit draws the same shapes. */
export function rng(seed = 7): Rand {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const gauss = (r: Rand) => {
  const u = Math.max(r(), 1e-6);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
};

/** A three-armed spiral of scattered light: requirements before they have a shape. */
export function nebula(n: number, r: Rand): Float32Array {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const halo = r() < 0.18;
    const rad = halo ? 0.4 + r() * 2.4 : Math.pow(r(), 0.7) * 2.1;
    const arm = Math.floor(r() * 3);
    const a = arm * ((Math.PI * 2) / 3) + rad * 2.3 + gauss(r) * (halo ? 1.2 : 0.22);
    out[i * 3] = Math.cos(a) * rad;
    out[i * 3 + 1] = gauss(r) * (halo ? 0.5 : 0.06 * (2.2 - rad));
    out[i * 3 + 2] = Math.sin(a) * rad * 0.9;
  }
  return out;
}

/* The white glyph of the Illumia mark, from /brand/illumia-mark.svg. */
const MARK_PATH =
  "M120.50,18.50L38.50,57.00L37.98,186.69L122.00,225.00L204.25,186.00L204.25,56.37ZM104.00,94.25L115.75,100.00L114.75,209.25L59.50,183.25L103.00,162.50ZM140.00,93.20L140.00,162.50L182.75,183.50L128.25,209.00L127.25,100.00ZM50.00,64.25L120.50,31.25L192.76,63.93L192.24,174.46L151.50,155.25L150.75,76.50L121.75,88.50L92.50,76.25L91.75,154.50L50.50,173.50Z";

/** Fill a 2D drawing and return the coordinates of its lit pixels, normalised to [-1, 1]. */
function rasterise(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): Float32Array {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  draw(ctx);
  const data = ctx.getImageData(0, 0, w, h).data;
  const pts: number[] = [];
  const step = 2;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 128) pts.push((x / w) * 2 - 1, 1 - (y / h) * 2);
    }
  }
  return new Float32Array(pts);
}

function fromPixels(n: number, r: Rand, px: Float32Array, sx: number, sy: number, depth: number): Float32Array {
  const out = new Float32Array(n * 3);
  const count = px.length / 2;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(r() * count) * 2;
    out[i * 3] = (px[k] + (r() - 0.5) * 0.008) * sx;
    out[i * 3 + 1] = (px[k + 1] + (r() - 0.5) * 0.008) * sy;
    out[i * 3 + 2] = (r() - 0.5) * depth;
  }
  return out;
}

const line = (ctx: CanvasRenderingContext2D, ...pts: number[]) => {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.stroke();
};
const box = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rad: number, fill = false) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, rad);
  if (fill) ctx.fill();
  else ctx.stroke();
};

/** The Illumia mark: the glyph filled with light, its rounded tile traced in a thinner line. */
export function mark(n: number, r: Rand): Float32Array {
  const glyph = rasterise(360, 360, (ctx) => {
    ctx.scale(360 / 237.5, 360 / 236.75);
    ctx.translate(-2.25, -4);
    ctx.fill(new Path2D(MARK_PATH), "evenodd");
    ctx.beginPath();
    ctx.arc(121.49, 59.03, 14.17, 0, Math.PI * 2);
    ctx.fill();
  });
  const rim = n * 0.16;
  const body = fromPixels(n, r, glyph, 1.05, 1.05, 0.12);
  // trace the tile outline with the first slice of points
  for (let i = 0; i < rim; i++) {
    const t = r() * 4;
    const side = Math.floor(t);
    const f = (t - side) * 2 - 1;
    const e = 1.22 + gauss(r) * 0.012;
    const [x, y] = side === 0 ? [f, 1] : side === 1 ? [1, -f] : side === 2 ? [-f, -1] : [-1, f];
    // squircle: pull corners in so the tile reads as rounded
    const k = Math.abs(x) > 0.9 && Math.abs(y) > 0.9 ? 0.94 : 1;
    body[i * 3] = x * e * k;
    body[i * 3 + 1] = y * e * k;
    body[i * 3 + 2] = (r() - 0.5) * 0.05;
  }
  return body;
}

/** An editor window with a </> glyph in it: the hero's promise, drawn in light. */
export function code(n: number, r: Rand): Float32Array {
  const px = rasterise(400, 300, (ctx) => {
    ctx.lineWidth = 5;
    box(ctx, 8, 8, 384, 284, 26);
    line(ctx, 8, 58, 392, 58);
    [38, 62, 86].forEach((x) => {
      ctx.beginPath();
      ctx.arc(x, 33, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    // a few lines of "code" on the title bar's right, like open tabs
    box(ctx, 250, 27, 50, 12, 6, true);
    box(ctx, 310, 27, 60, 12, 6, true);
    ctx.lineWidth = 22;
    line(ctx, 148, 118, 96, 174, 148, 230);
    line(ctx, 224, 106, 176, 242);
    line(ctx, 252, 118, 304, 174, 252, 230);
  });
  return fromPixels(n, r, px, 1.5, 1.12, 0.14);
}

/** A design artboard: selection handles, a hero image, text, a button, cards and a pointer. */
export function wireframe(n: number, r: Rand): Float32Array {
  const px = rasterise(400, 300, (ctx) => {
    ctx.lineWidth = 3;
    box(ctx, 24, 22, 352, 256, 4);
    // selection handles on the artboard corners
    [[24, 22], [376, 22], [24, 278], [376, 278]].forEach(([x, y]) => box(ctx, x - 8, y - 8, 16, 16, 2, true));
    ctx.lineWidth = 4;
    box(ctx, 44, 40, 312, 24, 6);
    box(ctx, 52, 47, 40, 10, 5, true);
    [270, 300, 330].forEach((x) => box(ctx, x, 49, 18, 6, 3, true));
    // hero image placeholder with its cross
    box(ctx, 44, 80, 180, 118, 8);
    line(ctx, 44, 80, 224, 198);
    line(ctx, 224, 80, 44, 198);
    // headline, copy and a button
    box(ctx, 240, 86, 116, 14, 7, true);
    box(ctx, 240, 110, 96, 8, 4, true);
    box(ctx, 240, 126, 106, 8, 4, true);
    box(ctx, 240, 158, 74, 28, 14, true);
    // three cards
    [44, 152, 260].forEach((x) => box(ctx, x, 214, 96, 46, 8));
    // the pointer, mid-drag
    ctx.beginPath();
    ctx.moveTo(318, 176);
    ctx.lineTo(318, 222);
    ctx.lineTo(330, 211);
    ctx.lineTo(340, 232);
    ctx.lineTo(348, 228);
    ctx.lineTo(338, 207);
    ctx.lineTo(354, 205);
    ctx.closePath();
    ctx.fill();
  });
  return fromPixels(n, r, px, 1.55, 1.16, 0.12);
}

/** A phone: rounded body, a notch, a grid of app icons and the home bar. */
export function phone(n: number, r: Rand): Float32Array {
  const px = rasterise(220, 400, (ctx) => {
    ctx.lineWidth = 6;
    box(ctx, 16, 8, 188, 384, 34);
    box(ctx, 82, 22, 56, 12, 6, true);
    ctx.lineWidth = 4;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        const x = 42 + col * 50;
        const y = 62 + row * 56;
        box(ctx, x, y, 36, 36, 10, (row + col) % 2 === 0);
      }
    }
    ctx.lineWidth = 3;
    box(ctx, 36, 296, 148, 50, 16);
    [52, 96, 140].forEach((x) => box(ctx, x, 305, 28, 30, 8, true));
    box(ctx, 78, 366, 64, 7, 4, true);
  });
  return fromPixels(n, r, px, 0.7, 1.28, 0.14);
}

/** Three stacked planes, front end over API over database, joined by risers. */
export function stack(n: number, r: Rand): Float32Array {
  const out = new Float32Array(n * 3);
  const levels = [0.62, 0, -0.62];
  const half = 0.82;
  for (let i = 0; i < n; i++) {
    const roll = r();
    let x: number;
    let y: number;
    let z: number;
    if (roll < 0.12) {
      // risers at the corners and a data column in the middle
      const c = Math.floor(r() * 5);
      x = c === 4 ? 0 : (c & 1 ? 1 : -1) * half;
      z = c === 4 ? 0 : (c & 2 ? 1 : -1) * half;
      y = (r() * 2 - 1) * 0.62;
      x += gauss(r) * 0.01;
      z += gauss(r) * 0.01;
    } else {
      const lv = levels[Math.floor(r() * 3)];
      y = lv + gauss(r) * 0.008;
      if (roll < 0.5) {
        // bright edges
        const t = r() * 4;
        const side = Math.floor(t);
        const f = ((t - side) * 2 - 1) * half;
        [x, z] = side === 0 ? [f, half] : side === 1 ? [half, f] : side === 2 ? [f, -half] : [-half, f];
      } else if (roll < 0.7) {
        // an inner grid, like tiles on the layer
        const g = Math.floor(r() * 4) / 3;
        const f = (r() * 2 - 1) * half * 0.8;
        const along = (g * 2 - 1) * half * 0.8;
        [x, z] = r() < 0.5 ? [along, f] : [f, along];
      } else {
        x = (r() * 2 - 1) * half;
        z = (r() * 2 - 1) * half;
      }
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

const fib = (k: number, count: number, rad: number): [number, number, number] => {
  const y = 1 - ((k + 0.5) / count) * 2;
  const s = Math.sqrt(1 - y * y);
  const a = k * 2.399963;
  return [Math.cos(a) * s * rad, y * rad * 0.8, Math.sin(a) * s * rad];
};

/** A hub with systems around it: CRM, ERP, payments, each wired to the centre and some to each other. */
export function network(n: number, r: Rand): Float32Array {
  const out = new Float32Array(n * 3);
  const NODES = 9;
  const sats = Array.from({ length: NODES }, (_, k) => fib(k, NODES, 1.25));
  const sizes = sats.map((_, k) => 0.07 + ((k * 37) % 5) * 0.012);
  const put = (i: number, x: number, y: number, z: number) => {
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  };
  const shell = (i: number, c: [number, number, number], rad: number) => {
    const y = r() * 2 - 1;
    const a = r() * Math.PI * 2;
    const s = Math.sqrt(1 - y * y);
    const k = rad * (0.85 + r() * 0.15);
    put(i, c[0] + Math.cos(a) * s * k, c[1] + y * k, c[2] + Math.sin(a) * s * k);
  };
  for (let i = 0; i < n; i++) {
    const roll = r();
    if (roll < 0.14) shell(i, [0, 0, 0], 0.24);
    else if (roll < 0.44) {
      const k = Math.floor(r() * NODES);
      shell(i, sats[k], sizes[k]);
    } else if (roll < 0.88) {
      // spokes from the hub
      const s = sats[Math.floor(r() * NODES)];
      const t = r();
      put(i, s[0] * t + gauss(r) * 0.006, s[1] * t + gauss(r) * 0.006, s[2] * t + gauss(r) * 0.006);
    } else {
      // a few systems also talk to each other
      const k = Math.floor(r() * NODES);
      const a = sats[k];
      const b = sats[(k + 2) % NODES];
      const t = r();
      put(i, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
    }
  }
  return out;
}

/** The delivery cycle: seven stages on one loop, with an arrow where Iterate hands back to Discover. */
export function cycle(n: number, r: Rand, stages = 7): Float32Array {
  const out = new Float32Array(n * 3);
  const R = 1.2;
  const at = (a: number, rad = R): [number, number] => [Math.cos(a) * rad, Math.sin(a) * rad];
  for (let i = 0; i < n; i++) {
    const roll = r();
    let x: number;
    let y = 0;
    let z: number;
    if (roll < 0.42) {
      const a = r() * Math.PI * 2;
      [x, z] = at(a, R + gauss(r) * 0.012);
      y = gauss(r) * 0.012;
    } else if (roll < 0.86) {
      const k = Math.floor(r() * stages);
      const [cx, cz] = at((k / stages) * Math.PI * 2);
      const s = k === 0 ? 0.13 : 0.09;
      x = cx + gauss(r) * s * 0.5;
      y = gauss(r) * s * 0.5;
      z = cz + gauss(r) * s * 0.5;
    } else {
      // chevron just before Discover, pointing the way the loop runs
      const a = -0.32;
      const [tx, tz] = at(a);
      const tan = [-Math.sin(a), Math.cos(a)];
      const rad = [Math.cos(a), Math.sin(a)];
      const arm = r() < 0.5 ? 1 : -1;
      const l = r() * 0.24;
      x = tx - (tan[0] * 0.8 + rad[0] * 0.6 * arm) * l;
      z = tz - (tan[1] * 0.8 + rad[1] * 0.6 * arm) * l;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** A git history: a main line of commits, with sprint branches splitting off and merging back. */
export function branches(n: number, r: Rand): Float32Array {
  const px = rasterise(440, 260, (ctx) => {
    const dot = (x: number, y: number, rad = 11) => {
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    };
    ctx.lineWidth = 6;
    line(ctx, 20, 130, 380, 130);
    ctx.lineWidth = 4;
    // feature branch up and back
    ctx.beginPath();
    ctx.moveTo(70, 130);
    ctx.bezierCurveTo(100, 130, 100, 60, 140, 60);
    ctx.lineTo(240, 60);
    ctx.bezierCurveTo(280, 60, 280, 130, 310, 130);
    ctx.stroke();
    // a second sprint branch below
    ctx.beginPath();
    ctx.moveTo(160, 130);
    ctx.bezierCurveTo(190, 130, 190, 200, 225, 200);
    ctx.lineTo(300, 200);
    ctx.bezierCurveTo(335, 200, 335, 130, 360, 130);
    ctx.stroke();
    [20, 70, 120, 160, 210, 260, 310, 360].forEach((x) => dot(x, 130));
    [140, 190, 240].forEach((x) => dot(x, 60, 9));
    [225, 262, 300].forEach((x) => dot(x, 200, 9));
    // HEAD: the newest commit, ringed, with a tag
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(400, 130, 16, 0, Math.PI * 2);
    ctx.stroke();
    dot(400, 130, 8);
    box(ctx, 372, 78, 58, 22, 11, true);
  });
  return fromPixels(n, r, px, 1.65, 0.98, 0.14);
}

/** A flat grid on the floor; the shader turns it into rolling terrain. */
export function terrain(n: number, r: Rand): Float32Array {
  const out = new Float32Array(n * 3);
  const side = Math.ceil(Math.sqrt(n));
  for (let i = 0; i < n; i++) {
    const gx = (i % side) / side;
    const gz = Math.floor(i / side) / side;
    out[i * 3] = (gx - 0.5) * 4.4 + (r() - 0.5) * 0.01;
    out[i * 3 + 1] = -0.55;
    out[i * 3 + 2] = (gz - 0.5) * 4.4 - 0.6;
  }
  return out;
}

/** A (2,3) torus knot with a fuzzy tube: sprint after sprint, one continuous line. */
export function knot(n: number, r: Rand): Float32Array {
  const out = new Float32Array(n * 3);
  const P = 2;
  const Q = 3;
  const at = (t: number) => {
    const rr = 0.75 + 0.3 * Math.cos(Q * t);
    return [rr * Math.cos(P * t), 0.3 * Math.sin(Q * t) * 1.4, rr * Math.sin(P * t)];
  };
  for (let i = 0; i < n; i++) {
    const t = r() * Math.PI * 2;
    const c = at(t);
    const tube = 0.06 + Math.abs(gauss(r)) * 0.05;
    const a = r() * Math.PI * 2;
    out[i * 3] = c[0] * 1.15 + Math.cos(a) * tube;
    out[i * 3 + 1] = c[1] * 1.15 + Math.sin(a) * tube;
    out[i * 3 + 2] = c[2] * 1.15 + Math.cos(a + 1.3) * tube;
  }
  return out;
}

export const offices = company.offices.map((o) => {
  const coords: Record<string, [number, number]> = {
    India: [22.57, 88.36],
    USA: [40.71, -74.0],
    Philippines: [14.6, 120.98],
    Australia: [-33.87, 151.21],
    Kenya: [-1.29, 36.82],
    Nigeria: [6.52, 3.38],
  };
  const [lat, lon] = coords[o.country];
  return { ...o, lat, lon };
});

const onSphere = (lat: number, lon: number, rad = 1): [number, number, number] => {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo) * rad, Math.sin(la) * rad, Math.cos(la) * Math.cos(lo) * rad];
};

/** A globe of latitude rings, with a bright cluster on each Illumia office and arcs between them. */
export function globe(n: number, r: Rand): Float32Array {
  const out = new Float32Array(n * 3);
  const put = (i: number, p: [number, number, number]) => {
    out[i * 3] = p[0];
    out[i * 3 + 1] = p[1];
    out[i * 3 + 2] = p[2];
  };
  for (let i = 0; i < n; i++) {
    const roll = r();
    if (roll < 0.1) {
      // office clusters
      const o = offices[Math.floor(r() * offices.length)];
      put(i, onSphere(o.lat + gauss(r) * 1.6, o.lon + gauss(r) * 1.6, 1.0 + Math.abs(gauss(r)) * 0.03));
    } else if (roll < 0.22) {
      // arcs from Kolkata to every other office, lifted off the surface
      const a = offices[0];
      const b = offices[1 + Math.floor(r() * (offices.length - 1))];
      const t = r();
      const pa = onSphere(a.lat, a.lon);
      const pb = onSphere(b.lat, b.lon);
      const m = [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t, pa[2] + (pb[2] - pa[2]) * t];
      const len = Math.hypot(m[0], m[1], m[2]) || 1;
      const lift = 1 + Math.sin(t * Math.PI) * 0.28;
      put(i, [(m[0] / len) * lift, (m[1] / len) * lift, (m[2] / len) * lift]);
    } else if (roll < 0.62) {
      // latitude rings
      const lat = Math.round((r() * 2 - 1) * 8) * 10;
      put(i, onSphere(lat + gauss(r) * 0.3, r() * 360));
    } else {
      // even dust over the surface
      const y = r() * 2 - 1;
      const a = r() * Math.PI * 2;
      const s = Math.sqrt(1 - y * y);
      put(i, [Math.cos(a) * s, y, Math.sin(a) * s]);
    }
  }
  return out;
}

/** Words set in light. */
export function words(n: number, r: Rand, text = "LET’S BUILD"): Float32Array {
  const px = rasterise(1400, 300, (ctx) => {
    ctx.font = "900 210px system-ui, 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 700, 160, 1360);
  });
  return fromPixels(n, r, px, 1.9, 0.41, 0.1);
}

const BUILD: Record<Shape, (n: number, r: Rand) => Float32Array> = {
  nebula, mark, code, wireframe, phone, stack, network, cycle, branches, terrain, knot, globe, words,
};

/**
 * How the shader moves each shape: 0 spiral, 1 a flat drawing that sways,
 * 2 a solid that turns, 3 the globe (steered by the page), 4 terrain that rolls like water.
 */
export const MOTION: Record<Shape, number> = {
  nebula: 0, mark: 1, code: 1, wireframe: 1, phone: 1, branches: 1, words: 1, terrain: 4, stack: 2, network: 2, cycle: 2, knot: 2, globe: 3,
};

/** Build a shape's cloud. Each has its own seed, so it draws the same whenever it is first needed. */
export const cloud = (shape: Shape, n: number) => BUILD[shape](n, rng(11 + Object.keys(BUILD).indexOf(shape) * 101));
