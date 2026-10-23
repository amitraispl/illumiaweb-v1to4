"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/gsap";

/*
 * The beacon: a WebGL field of charcoal lit by a crimson glow that trails the
 * pointer with inertia, with slow light rays and film grain. Falls back to the
 * CSS radial glow underneath when WebGL is unavailable.
 */
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_intensity;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - u_mouse) / u_res.y;
  float d = length(p);

  vec3 base = vec3(0.106, 0.106, 0.133);          // #1b1b22
  vec3 crimson = vec3(0.706, 0.122, 0.235);       // #B41F3C
  vec3 hot = vec3(0.902, 0.416, 0.510);           // #E66A82

  float glow = exp(-d * 3.2) * u_intensity;
  float core = exp(-d * 11.0) * 0.55 * u_intensity;

  // slow rays turning around the light
  float a = atan(p.y, p.x);
  float rays = noise(vec2(a * 3.0, u_time * 0.12)) * 0.5 + noise(vec2(a * 7.0, -u_time * 0.08)) * 0.5;
  rays = smoothstep(0.45, 1.0, rays) * exp(-d * 2.0) * 0.35 * u_intensity;

  vec3 col = base + crimson * (glow + rays) + hot * core;
  // vignette and grain
  col *= 1.0 - 0.45 * length(uv - 0.5);
  col += (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.035;
  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

export function Beacon({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uInt = gl.getUniformLocation(prog, "u_intensity");

    const dpr = Math.min(window.devicePixelRatio, 1.5);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // the light rests up-right of centre and follows the pointer with inertia
    const target = { x: w * 0.68, y: h * 0.42 };
    const pos = { ...target };
    let intensity = 0;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
    };
    window.addEventListener("pointermove", onMove);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const still = reducedMotion();
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = (now - start) / 1000;
      pos.x += (target.x - pos.x) * 0.06;
      pos.y += (target.y - pos.y) * 0.06;
      intensity += (1 - intensity) * 0.02; // the light switches on
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, pos.x * dpr, (h - pos.y) * dpr);
      gl.uniform1f(uTime, still ? 0 : t);
      gl.uniform1f(uInt, still ? 1 : intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (still) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(frame);
    canvas.dataset.ready = "1";

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
