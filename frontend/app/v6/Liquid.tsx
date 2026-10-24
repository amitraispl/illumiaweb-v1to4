"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/gsap";

/** Page-controlled state: 0 = molten blobs, 1 = the solid Illumia mark. `melt` ripples the surface. */
export const liquid = { solid: 0, melt: 0, paused: false };

/*
 * The Illumia mark, exactly as in public/brand/illumia-mark.svg: the white
 * glyph (even-odd fill) and its dot, in SVG units.
 */
const MARK_PATH =
  "M120.50,18.50L38.50,57.00L37.98,186.69L122.00,225.00L204.25,186.00L204.25,56.37ZM104.00,94.25L115.75,100.00L114.75,209.25L59.50,183.25L103.00,162.50ZM140.00,93.20L140.00,162.50L182.75,183.50L128.25,209.00L127.25,100.00ZM50.00,64.25L120.50,31.25L192.76,63.93L192.24,174.46L151.50,155.25L150.75,76.50L121.75,88.50L92.50,76.25L91.75,154.50L50.50,173.50Z";
const MARK_DOT = { cx: 121.49, cy: 59.03, r: 14.17 };

/* the glyph's centre, and the square of SVG space baked around it */
const CX = (37.98 + 204.25) / 2;
const CY = (18.5 + 225) / 2;
const SPAN = 242;
/* half the glyph's height becomes MARK_HALF in object space */
const MARK_HALF = 0.62;
const K = (225 - 18.5) / 2 / MARK_HALF;
const N = 512;
/* half the baked square, and one texel, in object units */
const BOX = SPAN / 2 / K;
const TEXEL = SPAN / N / K;

/** Exact squared-distance transform of one row or column (Felzenszwalb & Huttenlocher). */
function edt1d(f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}

/** Distance in texels from every pixel to the nearest seed pixel. */
function edt(seed: Uint8Array): Float64Array {
  const grid = new Float64Array(N * N);
  for (let i = 0; i < N * N; i++) grid[i] = seed[i] ? 0 : 1e20;
  const f = new Float64Array(N);
  const d = new Float64Array(N);
  const v = new Int32Array(N);
  const z = new Float64Array(N + 1);
  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) f[y] = grid[y * N + x];
    edt1d(f, N, d, v, z);
    for (let y = 0; y < N; y++) grid[y * N + x] = d[y];
  }
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) f[x] = grid[y * N + x];
    edt1d(f, N, d, v, z);
    for (let x = 0; x < N; x++) grid[y * N + x] = Math.sqrt(d[x]);
  }
  return grid;
}

/** Draw the real logo, then bake its signed distance field in object units: negative inside, positive outside. */
function bakeMark(): Float32Array {
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.scale(N / SPAN, N / SPAN);
  ctx.translate(SPAN / 2 - CX, SPAN / 2 - CY);
  ctx.fillStyle = "#fff";
  ctx.fill(new Path2D(MARK_PATH), "evenodd");
  ctx.beginPath();
  ctx.arc(MARK_DOT.cx, MARK_DOT.cy, MARK_DOT.r, 0, Math.PI * 2);
  ctx.fill();
  const px = ctx.getImageData(0, 0, N, N).data;
  const inside = new Uint8Array(N * N);
  const outside = new Uint8Array(N * N);
  for (let i = 0; i < N * N; i++) {
    inside[i] = px[i * 4 + 3] > 127 ? 1 : 0;
    outside[i] = 1 - inside[i];
  }
  const toInside = edt(inside);
  const toOutside = edt(outside);
  const out = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) {
    const sd = inside[i] ? -(toOutside[i] - 0.5) : toInside[i] - 0.5;
    out[i] = sd * TEXEL;
  }
  return out;
}

/*
 * A raymarched object in liquid chrome. Its signed distance field blends
 * between metaballs (fluid teams) and the Illumia mark extruded into a solid
 * plate (solid software); the mark's outline comes from the baked texture
 * above, so it is exactly the logo and the shader stays small enough to
 * compile quickly everywhere. Lit by a fake studio environment: two softboxes
 * and a crimson rim light.
 */
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uSolid; uniform float uMelt; uniform vec2 uMouse;
uniform sampler2D uMark;
/* the step count is a uniform so the compiler cannot unroll the march */
uniform int uSteps;
out vec4 fragColor;

const float BOX = ${BOX.toFixed(5)};

mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }

float blobs(vec3 p){
  float t = uTime * 0.7;
  float d = length(p) - 0.55;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec3 c = vec3(sin(t * (0.7 + fi * 0.13) + fi * 1.7), cos(t * (0.5 + fi * 0.11) + fi * 2.3), sin(t * (0.6 + fi * 0.07) + fi)) * 0.62;
    d = smin(d, length(p - c) - (0.26 + 0.05 * sin(t + fi)), 0.42);
  }
  return d;
}

/* the logo's 2D signed distance, read from the baked field; outside the baked square, distance to it */
float glyph(vec2 q){
  vec2 uv = vec2(0.5 + q.x / (2.0 * BOX), 0.5 - q.y / (2.0 * BOX));
  float s = texture(uMark, clamp(uv, 0.001, 0.999)).r;
  vec2 o = abs(q) - BOX * 0.98;
  float away = length(max(o, 0.0));
  return away > 0.0 ? away + max(s, 0.0) : s;
}

/* the glyph extruded into a plate with softened edges */
float mark(vec3 p){
  const float R = 0.012;
  vec2 w = vec2(glyph(p.xy) + R, abs(p.z) - 0.1);
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - R;
}

float map(vec3 p){
  // while liquid it tumbles; as it sets it turns to face you, swaying a little
  float solid = smoothstep(0.0, 1.0, uSolid);
  p.xz = rot(mix(uTime * 0.25, sin(uTime * 0.45) * 0.38, solid) + uMouse.x * 0.6) * p.xz;
  p.yz = rot(uMouse.y * 0.4 + sin(uTime * 0.3) * 0.12) * p.yz;
  float d = solid < 0.001 ? blobs(p) : solid > 0.999 ? mark(p) : mix(blobs(p), mark(p), solid);
  d += sin(p.x * 7.0 + uTime * 2.0) * sin(p.y * 6.0 - uTime * 1.6) * sin(p.z * 5.0 + uTime) * 0.035 * (uMelt + (1.0 - uSolid) * 0.6);
  return d;
}

vec3 normal(vec3 p){
  vec2 e = vec2(0.006, 0.0); // about two texels of the baked field, so the walls shade smoothly
  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx)));
}

vec3 env(vec3 r){
  vec3 col = mix(vec3(0.05, 0.05, 0.065), vec3(0.2, 0.2, 0.24), smoothstep(-0.6, 0.8, r.y));
  col += vec3(1.0) * pow(max(dot(r, normalize(vec3(0.3, 1.0, 0.4))), 0.0), 18.0) * 1.6;      // top softbox
  col += vec3(0.95, 0.4, 0.5) * pow(max(dot(r, normalize(vec3(-1.0, 0.2, 0.3))), 0.0), 6.0) * 1.8; // crimson key
  col += vec3(0.7, 0.12, 0.24) * pow(max(dot(r, normalize(vec3(1.0, -0.3, 0.2))), 0.0), 4.0) * 1.2; // crimson fill
  return col;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 ro = vec3(0.0, 0.0, 3.1);
  vec3 rd = normalize(vec3(uv, -1.55));
  float t = 0.0; float minD = 10.0; bool hit = false;
  for (int i = 0; i < uSteps; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    minD = min(minD, d);
    if (d < 0.0004 + t * 0.0003) { hit = true; break; } // relative to distance: no banding on grazing walls
    t += d * 0.85;
    if (t > 7.0) break;
  }
  vec4 col = vec4(0.0);
  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = normal(p);
    vec3 r = reflect(rd, n);
    float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    vec3 c = env(r) * mix(0.55, 1.15, fres) * vec3(1.0, 0.92, 0.94);
    c += vec3(0.9, 0.25, 0.38) * fres * 0.8;
    col = vec4(c, 1.0);
  } else {
    // a crimson halo where the rays grazed the surface
    float g = exp(-minD * 7.0) * 0.55;
    col = vec4(vec3(0.71, 0.12, 0.24) * g, g);
  }
  fragColor = col;
}`;

const VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

export function Liquid({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {
      res: gl.getUniformLocation(prog, "uRes"), time: gl.getUniformLocation(prog, "uTime"),
      solid: gl.getUniformLocation(prog, "uSolid"), melt: gl.getUniformLocation(prog, "uMelt"), mouse: gl.getUniformLocation(prog, "uMouse"),
      steps: gl.getUniformLocation(prog, "uSteps"), mark: gl.getUniformLocation(prog, "uMark"),
    };

    /* the logo's distance field as half floats (filterable in WebGL2), so the walls stay smooth between texels */
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, N, N, 0, gl.RED, gl.FLOAT, bakeMark());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U.mark, 0);

    // raymarching is per-pixel: render under native resolution and let CSS scale it
    const scale = Math.min(window.devicePixelRatio || 1, 1) * 0.75;
    const resize = () => {
      canvas.width = Math.round(canvas.clientWidth * scale);
      canvas.height = Math.round(canvas.clientHeight * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const m = { x: 0, y: 0, tx: 0, ty: 0 };
    const move = (e: PointerEvent) => {
      m.tx = (e.clientX / window.innerWidth) * 2 - 1;
      m.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const still = reducedMotion();
    if (still) liquid.solid = 1;
    let raf = 0;
    let time = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible || document.hidden) return;
      if (!liquid.paused && !still) time += dt;
      m.x += (m.tx - m.x) * 0.05;
      m.y += (m.ty - m.y) * 0.05;
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, time + 3);
      gl.uniform1f(U.solid, liquid.solid);
      gl.uniform1f(U.melt, liquid.melt);
      gl.uniform2f(U.mouse, still ? 0 : m.x, still ? 0 : m.y);
      gl.uniform1i(U.steps, 90);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (still) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", move);
      gl.deleteTexture(tex);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
