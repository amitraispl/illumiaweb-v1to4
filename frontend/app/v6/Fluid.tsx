"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/gsap";
import { INK, flux, nextInk, type Splat } from "./flux";

/*
 * A stable-fluids simulation on the GPU (WebGL2, half-float targets):
 * curl → vorticity confinement → divergence → Jacobi pressure → gradient
 * subtract → advect velocity → advect dye. Ink is the brand crimsons on
 * charcoal, shaded with a pseudo-normal from the dye's gradient and a soft glow.
 * Falls back to the CSS gradient behind it when float render targets are missing.
 */

const VERT = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
uniform vec2 texelSize;
void main(){
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0); vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y); vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const HEAD = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
out vec4 o;
`;

const FRAG = {
  clear: HEAD + `uniform sampler2D uTexture; uniform float value;
void main(){ o = value * texture(uTexture, vUv); }`,

  splat: HEAD + `uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
void main(){
  vec2 p = vUv - point; p.x *= aspectRatio;
  vec3 s = exp(-dot(p, p) / radius) * color;
  o = vec4(texture(uTarget, vUv).xyz + s, 1.0);
}`,

  advection: HEAD + `uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform float dt; uniform float dissipation;
void main(){
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  o = texture(uSource, coord) / (1.0 + dissipation * dt);
}`,

  divergence: HEAD + `uniform sampler2D uVelocity;
void main(){
  float L = texture(uVelocity, vL).x; float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y; float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
  o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`,

  curl: HEAD + `uniform sampler2D uVelocity;
void main(){
  float L = texture(uVelocity, vL).y; float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x; float B = texture(uVelocity, vB).x;
  o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`,

  vorticity: HEAD + `uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
void main(){
  float L = texture(uCurl, vL).x; float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x; float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C; force.y *= -1.0;
  vec2 v = texture(uVelocity, vUv).xy + force * dt;
  o = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
}`,

  pressure: HEAD + `uniform sampler2D uPressure; uniform sampler2D uDivergence;
void main(){
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  float div = texture(uDivergence, vUv).x;
  o = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}`,

  gradient: HEAD + `uniform sampler2D uPressure; uniform sampler2D uVelocity;
void main(){
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  vec2 v = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  o = vec4(v, 0.0, 1.0);
}`,

  display: HEAD + `uniform sampler2D uTexture; uniform vec2 dyeTexel; uniform float time; uniform float light;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec3 c = texture(uTexture, vUv).rgb;
  // pseudo-normal from the ink's gradient: wet, glossy edges
  vec2 e = dyeTexel * 2.0;
  float l = length(texture(uTexture, vUv - vec2(e.x, 0.0)).rgb);
  float r = length(texture(uTexture, vUv + vec2(e.x, 0.0)).rgb);
  float t = length(texture(uTexture, vUv + vec2(0.0, e.y)).rgb);
  float b = length(texture(uTexture, vUv - vec2(0.0, e.y)).rgb);
  vec3 n = normalize(vec3(l - r, b - t, 0.18));
  float diffuse = clamp(dot(n, normalize(vec3(-0.4, 0.6, 1.0))), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-normalize(vec3(-0.4, 0.6, 1.0)), n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 24.0);
  // soft glow: a ring of wide taps
  vec3 glow = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.785398;
    glow += texture(uTexture, vUv + vec2(cos(a), sin(a)) * 0.025).rgb;
  }
  glow /= 8.0;
  vec3 ink = c * (0.55 + 0.6 * diffuse) + spec * min(length(c), 1.0) * 0.55;
  vec3 col;
  if (light > 0.5) {
    // paper: dye absorbs the light it isn't, so crimson dye prints as crimson ink and white dye as grey wash
    float amount = length(c + glow * 0.35);
    vec3 hue = (c + 0.0001) / max(max(c.r, max(c.g, c.b)), 0.0001);
    vec3 absorb = (vec3(1.0) - hue) * 2.1 + 0.22;
    col = vec3(0.957, 0.961, 0.969) * exp(-absorb * amount * 0.8);
    col -= spec * min(amount, 1.0) * 0.08 - (diffuse - 0.5) * min(amount, 1.0) * 0.06;
    col *= 1.0 - 0.1 * length(vUv - 0.5);
  } else {
    col = vec3(0.106, 0.106, 0.13) + (1.0 - exp(-(ink + glow * 0.45) * 1.5));
    col *= 1.0 - 0.38 * length(vUv - 0.5);
  }
  col += (hash(vUv * 1000.0 + time) - 0.5) * 0.03;
  o = vec4(col, 1.0);
}`,
};

type Prog = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };
type FBO = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number; tx: number; ty: number; attach: (id: number) => number };
type Double = { read: FBO; write: FBO; swap: () => void; w: number; h: number; tx: number; ty: number };

export function Fluid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl2", { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false });
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) {
      flux.ok = false;
      return;
    }
    gl.getExtension("OES_texture_float_linear");

    const small = window.innerWidth < 900 || (navigator.hardwareConcurrency ?? 8) <= 4;
    const SIM = 128;
    const DYE = small ? 512 : 1024;
    const ITER = small ? 14 : 22;
    flux.sim = SIM;
    flux.dye = DYE;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
      return s;
    };
    const vert = compile(gl.VERTEX_SHADER, VERT);
    const make = (src: string): Prog => {
      const p = gl.createProgram()!;
      gl.attachShader(p, vert);
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, src));
      gl.bindAttribLocation(p, 0, "aPosition");
      gl.linkProgram(p);
      const u: Prog["u"] = {};
      const count = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < count; i++) {
        const name = gl.getActiveUniform(p, i)!.name;
        u[name] = gl.getUniformLocation(p, name);
      }
      return { p, u };
    };
    const P = Object.fromEntries(Object.entries(FRAG).map(([k, v]) => [k, make(v)])) as Record<keyof typeof FRAG, Prog>;

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    const blit = (target: FBO | null) => {
      if (target) {
        gl.viewport(0, 0, target.w, target.h);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      } else {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    const fbo = (w: number, h: number): FBO => {
      gl.activeTexture(gl.TEXTURE0);
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      const f = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return {
        tex, fbo: f, w, h, tx: 1 / w, ty: 1 / h,
        attach: (id) => {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          return id;
        },
      };
    };
    const double = (w: number, h: number): Double => {
      const d = { read: fbo(w, h), write: fbo(w, h), w, h, tx: 1 / w, ty: 1 / h, swap() { const t = d.read; d.read = d.write; d.write = t; } };
      return d;
    };
    const res = (r: number) => {
      let a = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (a < 1) a = 1 / a;
      const min = Math.round(r);
      const max = Math.round(r * a);
      return gl.drawingBufferWidth > gl.drawingBufferHeight ? { w: max, h: min } : { w: min, h: max };
    };

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let velocity: Double, dye: Double, pressure: Double, divergence: FBO, curl: FBO;
    const size = () => {
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      const s = res(SIM);
      const d = res(DYE);
      velocity = double(s.w, s.h);
      pressure = double(s.w, s.h);
      divergence = fbo(s.w, s.h);
      curl = fbo(s.w, s.h);
      dye = double(d.w, d.h);
    };
    size();
    let resizeT = 0;
    const onResize = () => {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(size, 200);
    };
    window.addEventListener("resize", onResize);

    const aspect = () => canvas.width / canvas.height;
    const splatOne = (s: Splat) => {
      const r = (s.radius / 100) * (aspect() > 1 ? aspect() : 1);
      gl.useProgram(P.splat.p);
      gl.uniform1i(P.splat.u.uTarget, velocity.read.attach(0));
      gl.uniform1f(P.splat.u.aspectRatio, aspect());
      gl.uniform2f(P.splat.u.point, s.x, s.y);
      gl.uniform3f(P.splat.u.color, s.dx, s.dy, 0);
      gl.uniform1f(P.splat.u.radius, r);
      blit(velocity.write);
      velocity.swap();
      gl.uniform1i(P.splat.u.uTarget, dye.read.attach(0));
      gl.uniform3f(P.splat.u.color, s.color[0], s.color[1], s.color[2]);
      blit(dye.write);
      dye.swap();
    };

    const step = (dt: number, dyeLoss: number) => {
      gl.useProgram(P.curl.p);
      gl.uniform2f(P.curl.u.texelSize, velocity.tx, velocity.ty);
      gl.uniform1i(P.curl.u.uVelocity, velocity.read.attach(0));
      blit(curl);

      gl.useProgram(P.vorticity.p);
      gl.uniform2f(P.vorticity.u.texelSize, velocity.tx, velocity.ty);
      gl.uniform1i(P.vorticity.u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(P.vorticity.u.uCurl, curl.attach(1));
      gl.uniform1f(P.vorticity.u.curl, flux.overdrive ? 70 : 28);
      gl.uniform1f(P.vorticity.u.dt, dt);
      blit(velocity.write);
      velocity.swap();

      gl.useProgram(P.divergence.p);
      gl.uniform2f(P.divergence.u.texelSize, velocity.tx, velocity.ty);
      gl.uniform1i(P.divergence.u.uVelocity, velocity.read.attach(0));
      blit(divergence);

      gl.useProgram(P.clear.p);
      gl.uniform1i(P.clear.u.uTexture, pressure.read.attach(0));
      gl.uniform1f(P.clear.u.value, 0.8);
      blit(pressure.write);
      pressure.swap();

      gl.useProgram(P.pressure.p);
      gl.uniform2f(P.pressure.u.texelSize, velocity.tx, velocity.ty);
      gl.uniform1i(P.pressure.u.uDivergence, divergence.attach(0));
      for (let i = 0; i < ITER; i++) {
        gl.uniform1i(P.pressure.u.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      gl.useProgram(P.gradient.p);
      gl.uniform2f(P.gradient.u.texelSize, velocity.tx, velocity.ty);
      gl.uniform1i(P.gradient.u.uPressure, pressure.read.attach(0));
      gl.uniform1i(P.gradient.u.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      gl.useProgram(P.advection.p);
      gl.uniform2f(P.advection.u.texelSize, velocity.tx, velocity.ty);
      const v = velocity.read.attach(0);
      gl.uniform1i(P.advection.u.uVelocity, v);
      gl.uniform1i(P.advection.u.uSource, v);
      gl.uniform1f(P.advection.u.dt, dt);
      gl.uniform1f(P.advection.u.dissipation, 0.25);
      blit(velocity.write);
      velocity.swap();

      gl.uniform1i(P.advection.u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(P.advection.u.uSource, dye.read.attach(1));
      gl.uniform1f(P.advection.u.dissipation, dyeLoss);
      blit(dye.write);
      dye.swap();
    };

    let time = 0;
    const render = () => {
      gl.useProgram(P.display.p);
      gl.uniform2f(P.display.u.texelSize, 1 / canvas.width, 1 / canvas.height);
      gl.uniform2f(P.display.u.dyeTexel, dye.tx, dye.ty);
      gl.uniform1i(P.display.u.uTexture, dye.read.attach(0));
      gl.uniform1f(P.display.u.time, time);
      gl.uniform1f(P.display.u.light, flux.light ? 1 : 0);
      blit(null);
    };

    /* the cursor is a stirring rod */
    const ptr = { x: 0, y: 0, moved: false, dx: 0, dy: 0, inited: false };
    const move = (e: PointerEvent) => {
      if (!ptr.inited) {
        ptr.x = e.clientX;
        ptr.y = e.clientY;
        ptr.inited = true;
        return;
      }
      ptr.dx += e.clientX - ptr.x;
      ptr.dy += e.clientY - ptr.y;
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.moved = true;
    };
    window.addEventListener("pointermove", move);

    /* ambient currents per mode: emitters are points that wander and breathe ink */
    const emit = (t: number, dt: number) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const e = flux.energy * (flux.overdrive ? 2.2 : 1);
      const at = (x: number, y: number, dx: number, dy: number, scale: number, radius = 0.12) =>
        flux.queue.push({ x: x / W, y: 1 - y / H, dx: dx * 10, dy: -dy * 10, color: nextInk(scale), radius });
      const chance = (p: number) => Math.random() < p * dt * 60;
      switch (flux.mode) {
        case "calm":
          for (let i = 0; i < 2; i++) {
            if (!chance(0.5 * e)) continue;
            const a = t * (0.21 + i * 0.13) + i * 2.1;
            const x = W * (0.5 + Math.cos(a) * 0.36);
            const y = H * (0.5 + Math.sin(a * 1.3) * 0.3);
            at(x, y, -Math.sin(a) * 6 * e, Math.cos(a * 1.3) * 5 * e, 0.12 * e);
          }
          break;
        case "storm":
          for (let i = 0; i < 5; i++) {
            if (!chance(0.7 * e)) continue;
            const a = t * (0.6 + i * 0.17) + i * 1.3;
            at(W * (0.5 + Math.cos(a) * 0.42), H * (0.5 + Math.sin(a * 1.7) * 0.4), Math.cos(a * 2.1) * 22 * e, Math.sin(a * 1.4) * 22 * e, 0.22 * e, 0.16);
          }
          break;
        case "vortex": {
          for (let i = 0; i < 4; i++) {
            if (!chance(0.8 * e)) continue;
            const a = t * 0.9 + (i / 4) * Math.PI * 2;
            const rad = Math.min(W, H) * 0.32;
            at(W / 2 + Math.cos(a) * rad, H / 2 + Math.sin(a) * rad, -Math.sin(a) * 18 * e, Math.cos(a) * 18 * e, 0.16 * e, 0.14);
          }
          break;
        }
        case "rain":
          if (chance(1.2 * e)) at(Math.random() * W, -10, (Math.random() - 0.5) * 4, 16 * e, 0.2 * e, 0.08 + Math.random() * 0.08);
          break;
        case "jets":
          if (chance(0.9 * e)) {
            const left = Math.random() < 0.5;
            at(left ? 0 : W, H * (0.3 + Math.random() * 0.4), (left ? 1 : -1) * 26 * e, (Math.random() - 0.5) * 6, 0.22 * e, 0.12);
          }
          break;
        case "still":
          break;
      }
    };

    const still = reducedMotion();
    let lastY = window.scrollY;
    let last = performance.now();
    let raf = 0;
    const seed = () => {
      for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2;
        flux.queue.push({ x: 0.5 + Math.cos(a) * 0.3, y: 0.5 + Math.sin(a) * 0.3, dx: Math.cos(a + 1.6) * 300, dy: Math.sin(a + 1.6) * 300, color: nextInk(0.32), radius: 0.4 });
      }
    };
    seed();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const raw = Math.max(now - last, 1);
      const dt = Math.min(raw / 1000, 0.0167);
      last = now;
      flux.fps += (1000 / raw - flux.fps) * 0.05;

      if (still) {
        // reduced motion: let the seeded ink settle into one still image, then stop
        while (flux.queue.length) splatOne(flux.queue.shift()!);
        for (let i = 0; i < 90; i++) step(0.016, 0.0);
        render();
        cancelAnimationFrame(raf);
        return;
      }

      if (!flux.paused) {
        time += dt;
        if (ptr.moved) {
          splatOne({ x: ptr.x / window.innerWidth, y: 1 - ptr.y / window.innerHeight, dx: ptr.dx * 8, dy: -ptr.dy * 8, color: nextInk(0.32), radius: 0.22 });
          ptr.dx = 0;
          ptr.dy = 0;
          ptr.moved = false;
        }
        // scrolling pushes the ink the way the page moves
        const y = window.scrollY;
        const v = y - lastY;
        lastY = y;
        if (Math.abs(v) > 2) {
          for (let i = 0; i < 2; i++) {
            flux.queue.push({ x: Math.random(), y: 0.15 + Math.random() * 0.7, dx: (Math.random() - 0.5) * 60, dy: Math.max(-900, Math.min(900, v * 9)), color: nextInk(Math.min(Math.abs(v) / 300, 0.18)), radius: 0.35 });
          }
        }
        emit(time, dt);
        if (flux.flood) {
          const age = (now - flux.flood.t) / 1000;
          // crimson only and modest: a flood of white-hot dye would blow the next page out to white
          const c = Math.random() < 0.5 ? INK.crimson : INK.deep;
          for (let i = 0; i < 3; i++) {
            const a = Math.random() * Math.PI * 2;
            const d = age * 0.6 * Math.random();
            flux.queue.push({
              x: flux.flood.x + Math.cos(a) * d, y: flux.flood.y + Math.sin(a) * d,
              dx: Math.cos(a) * 900, dy: Math.sin(a) * 900, color: [c[0] * 0.22, c[1] * 0.22, c[2] * 0.22], radius: 0.5 + age * 0.8,
            });
          }
        }
        const q = flux.queue.splice(0, 40);
        q.forEach(splatOne);
        step(dt, now < flux.drainUntil ? 6 : 0.55);
      } else {
        flux.queue.length = 0;
      }
      render();
    };
    raf = requestAnimationFrame(frame);
    canvas.dataset.ready = "1";

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", move);
      window.clearTimeout(resizeT);
    };
  }, []);

  return <canvas ref={ref} className="v6-fluid" aria-hidden="true" />;
}
