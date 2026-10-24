"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/gsap";
import { SLOTS, state, type Shape } from "./field";
import { MOTION, cloud, rng } from "./shapes";

/*
 * The light field: tens of thousands of points on the GPU. Every point knows
 * where it sits in each of six loaded shapes; the vertex shader moves each one
 * its own way, blends them with the weights in `state.w`, then adds turbulence,
 * the pointer's push and click shockwaves. On the dark theme additive blending
 * turns dense regions into glow; on the light theme points are laid down as ink.
 */

const VERT = `
attribute vec3 a0; attribute vec3 a1; attribute vec3 a2;
attribute vec3 a3; attribute vec3 a4; attribute vec3 a5;
attribute vec4 aR;
uniform vec3 uWa; uniform vec3 uWb; uniform vec3 uMa; uniform vec3 uMb;
uniform float uTime, uChaos, uAspect, uScale, uDim, uWarp, uFlow, uPx, uMouseOn, uLight;
uniform vec2 uOffset, uMouse, uTilt, uGlobe;
uniform vec3 uShock;
varying vec3 vCol; varying float vA;

vec3 rotY(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(p.x*c + p.z*s, p.y, -p.x*s + p.z*c); }
vec3 rotX(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(p.x, p.y*c - p.z*s, p.y*s + p.z*c); }

// each slot moves the way its shape asks: 0 spiral, 1 a swaying drawing, 2 a turning solid, 3 the globe, 4 rolling terrain
vec3 move(vec3 p, float mode, float t){
  if (mode < 0.5) return rotX(rotY(p, t * 0.12 / (0.35 + length(p.xz))), 0.42);
  if (mode < 1.5) { p.z += sin(t * 1.3 + p.x * 3.0 + p.y * 2.0) * 0.035; return rotY(p, sin(t * 0.4) * 0.22); }
  if (mode < 2.5) return rotX(rotY(p, t * 0.25), 0.6 + sin(t * 0.2) * 0.2);
  if (mode < 3.5) return rotX(rotY(p, uGlobe.x), uGlobe.y);
  p.y += sin(p.x * 2.2 + t * 0.9) * 0.13 + cos(p.z * 1.7 - t * 0.7) * 0.11 + sin((p.x + p.z) * 4.0 + t * 1.6) * 0.03;
  return p;
}
vec3 slot(vec3 p, float w, float mode, float t){ return w > 0.0001 ? move(p, mode, t) * w : vec3(0.0); }

void main(){
  float t = uTime;

  float sum = max(uWa.x + uWa.y + uWa.z + uWb.x + uWb.y + uWb.z, 0.0001);
  vec3 p = (slot(a0, uWa.x, uMa.x, t) + slot(a1, uWa.y, uMa.y, t) + slot(a2, uWa.z, uMa.z, t)
          + slot(a3, uWb.x, uMb.x, t) + slot(a4, uWb.y, uMb.y, t) + slot(a5, uWb.z, uMb.z, t)) / sum;

  // warp: a starfield streaming at the camera, with a clear tunnel in the middle
  vec3 warp = vec3((aR.x - 0.5) * 7.0, (aR.y - 0.5) * 4.6, -5.0 + fract(aR.w + uFlow) * 7.4);
  warp.xy += normalize(warp.xy + 0.0001) * 0.45;
  p = mix(p, warp, uWarp);

  vec3 jit = vec3(sin(t * 0.9 + aR.x * 40.0), cos(t * 0.8 + aR.y * 40.0), sin(t * 0.7 + aR.z * 40.0));
  p += jit * (0.005 + uChaos * 0.25) + (aR.xyz - 0.5) * uChaos * 1.7;

  p *= uScale;
  p = rotX(rotY(p, uTilt.x * 0.35), -uTilt.y * 0.22);

  float depth = max(3.4 - p.z, 0.25);
  vec2 ndc = p.xy * 1.9 / depth;
  ndc.x /= uAspect;
  ndc += uOffset;

  vec2 d = ndc - uMouse; d.x *= uAspect;
  float l = length(d);
  float push = exp(-l * l * 22.0) * 0.17 * uMouseOn;

  vec2 ds = ndc - uShock.xy; ds.x *= uAspect;
  float ls = length(ds);
  float wave = exp(-pow((ls - uShock.z * 1.9) * 6.0, 2.0)) * 0.24 * max(0.0, 1.0 - uShock.z / 1.4);

  vec2 shift = d / max(l, 0.0001) * push + ds / max(ls, 0.0001) * wave;
  shift.x /= uAspect;
  ndc += shift;

  gl_Position = vec4(ndc, 0.0, 1.0);
  gl_PointSize = clamp(uPx * (0.55 + aR.w * 1.3) * (3.4 / depth), 0.0, 48.0);

  vec3 hot = vec3(0.902, 0.416, 0.510);
  vec3 crim = vec3(0.706, 0.122, 0.235) * 1.6;
  vec3 white = vec3(1.0, 0.93, 0.95);
  vec3 col = aR.z < 0.6 ? hot : (aR.z < 0.88 ? crim : white);
  vCol = col + (push * 7.0 + wave * 5.0) * vec3(1.0, 0.75, 0.8);
  vA = (0.22 + 0.78 * aR.y) * uDim * smoothstep(3.3, 1.6, p.z);

  // on paper: brand crimson, its deep shade and a little charcoal, darkening where the pointer pushes
  vec3 ink = aR.z < 0.62 ? vec3(0.706, 0.122, 0.235) : (aR.z < 0.9 ? vec3(0.557, 0.086, 0.180) : vec3(0.239, 0.239, 0.243));
  ink = mix(ink, vec3(0.45, 0.04, 0.12), clamp(push * 6.0 + wave * 4.0, 0.0, 1.0));
  vCol = mix(vCol, ink, uLight);
  vA *= mix(1.0, 1.35, uLight);
}`;

const FRAG = `
precision mediump float;
varying vec3 vCol; varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c) * 4.0;
  if (d > 1.0) discard;
  float a = exp(-d * 4.0) * vA;
  gl_FragColor = vec4(vCol * a, a);
}`;

export function LightField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance" });
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

    const small = window.innerWidth < 900 || (navigator.hardwareConcurrency ?? 8) <= 4;
    const N = small ? 12000 : 26000;
    state.count = N;
    const r = rng(11);
    const rand = new Float32Array(N * 4);
    for (let i = 0; i < rand.length; i++) rand[i] = r();

    const bind = (name: string, data: Float32Array, size: number) => {
      const loc = gl.getAttribLocation(prog, name);
      const buf = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      if (loc < 0) return buf;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return buf;
    };

    /* shapes are built the first time a page asks for them, then kept */
    const cache = new Map<Shape, Float32Array>();
    const get = (s: Shape) => {
      let c = cache.get(s);
      if (!c) cache.set(s, (c = cloud(s, N)));
      return c;
    };
    const loaded = [...state.slots];
    const buffers = loaded.map((s, i) => bind(`a${i}`, get(s), 3));
    bind("aR", rand, 4);
    const sync = () => {
      for (let i = 0; i < SLOTS; i++) {
        if (loaded[i] === state.slots[i]) continue;
        loaded[i] = state.slots[i];
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, get(loaded[i]));
      }
    };

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const U = {
      wa: u("uWa"), wb: u("uWb"), ma: u("uMa"), mb: u("uMb"), light: u("uLight"), time: u("uTime"), chaos: u("uChaos"), aspect: u("uAspect"), scale: u("uScale"),
      dim: u("uDim"), warp: u("uWarp"), flow: u("uFlow"), px: u("uPx"), mouseOn: u("uMouseOn"),
      offset: u("uOffset"), mouse: u("uMouse"), tilt: u("uTilt"), globe: u("uGlobe"), shock: u("uShock"),
    };

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    let light: boolean | null = null;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0, on: 0, ton: 0 };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = 1 - (e.clientY / window.innerHeight) * 2;
      mouse.ton = 1;
    };
    const leave = () => (mouse.ton = 0);
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);

    const still = reducedMotion();
    if (still) state.chaos = 0;
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let lastY = window.scrollY;
    let frame = 0;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (document.hidden) return;
      frame++;
      if (still && frame % 12 !== 0) return;
      state.fps += (1 / Math.max(dt, 0.001) - state.fps) * 0.05;

      const live = !still && !state.paused;
      if (live) time += dt;

      const y = window.scrollY;
      const v = Math.abs(y - lastY) / Math.max(dt, 0.001);
      lastY = y;
      state.speed += (Math.min(v / 1800, 3) - state.speed) * 0.08;
      if (live) {
        state.flow += dt * (0.06 + state.speed * 0.35);
        state.shock.t += dt;
        if (!state.globeLocked) state.yaw += dt * 0.16;
      }

      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      mouse.on += ((live ? mouse.ton : 0) - mouse.on) * 0.06;

      sync();
      if (light !== state.light) {
        light = state.light;
        // glow adds up on the dark; ink layers over the paper
        if (light) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        else gl.blendFunc(gl.ONE, gl.ONE);
        gl.uniform1f(U.light, light ? 1 : 0);
      }

      gl.clear(gl.COLOR_BUFFER_BIT);
      const w = state.w;
      const m = loaded.map((s) => MOTION[s]);
      gl.uniform3f(U.wa, w[0], w[1], w[2]);
      gl.uniform3f(U.wb, w[3], w[4], w[5]);
      gl.uniform3f(U.ma, m[0], m[1], m[2]);
      gl.uniform3f(U.mb, m[3], m[4], m[5]);
      gl.uniform1f(U.time, time);
      gl.uniform1f(U.chaos, state.chaos);
      gl.uniform1f(U.aspect, canvas.width / canvas.height);
      gl.uniform1f(U.scale, state.scale * (canvas.width < canvas.height ? 0.62 : 1));
      gl.uniform1f(U.dim, state.dim);
      gl.uniform1f(U.warp, state.warp);
      gl.uniform1f(U.flow, state.flow);
      gl.uniform1f(U.px, (small ? 2.6 : 2.2) * dpr);
      gl.uniform1f(U.mouseOn, mouse.on);
      gl.uniform2f(U.offset, state.x, state.y);
      gl.uniform2f(U.mouse, mouse.x, mouse.y);
      gl.uniform2f(U.tilt, live ? mouse.x * mouse.on : 0, live ? mouse.y * mouse.on : 0);
      gl.uniform2f(U.globe, state.yaw, state.pitch);
      gl.uniform3f(U.shock, state.shock.x, state.shock.y, state.shock.t);
      gl.drawArrays(gl.POINTS, 0, N);
    };
    raf = requestAnimationFrame(draw);
    canvas.dataset.ready = "1";

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={ref} className="v5-light" aria-hidden="true" />;
}
