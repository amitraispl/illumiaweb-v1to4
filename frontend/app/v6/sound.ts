"use client";

/*
 * Generative sound, all synthesised (no files): a low drone whose filter opens
 * with scroll speed, soft blips on hover, a thud for collisions and a filtered
 * noise sweep for page transitions. Off until the visitor turns it on.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let filter: BiquadFilterNode | null = null;
let noise: AudioBuffer | null = null;
let on = false;
let lastBlip = 0;

function boot() {
  if (ctx) return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // the drone: two detuned saws and a sub, through a slow-breathing low-pass
  filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 320;
  filter.Q.value = 6;
  const drone = ctx.createGain();
  drone.gain.value = 0.05;
  filter.connect(drone).connect(master);
  [55, 55.4, 27.5].forEach((f, i) => {
    const o = ctx!.createOscillator();
    o.type = i === 2 ? "sine" : "sawtooth";
    o.frequency.value = f;
    o.connect(filter!);
    o.start();
  });
  const lfo = ctx.createOscillator();
  const depth = ctx.createGain();
  lfo.frequency.value = 0.07;
  depth.gain.value = 140;
  lfo.connect(depth).connect(filter.frequency);
  lfo.start();

  noise = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

export function soundOn() {
  return on;
}

export function setSound(enabled: boolean) {
  on = enabled;
  if (enabled) boot();
  if (!ctx || !master) return;
  if (enabled) ctx.resume();
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(enabled ? 0.9 : 0, ctx.currentTime, 0.4);
}

/** Scroll speed opens the drone's filter. 0…1 */
export function intensity(v: number) {
  if (!on || !ctx || !filter) return;
  filter.frequency.setTargetAtTime(320 + v * 1400, ctx.currentTime, 0.25);
}

function tone(freq: number, dur: number, gain: number, type: OscillatorType = "sine", slide = 1) {
  if (!on || !ctx || !master) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/* pentatonic, so any run of blips sounds intended */
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
export function blip(i = Math.floor(Math.random() * SCALE.length)) {
  const now = performance.now();
  if (now - lastBlip < 40) return;
  lastBlip = now;
  tone(SCALE[i % SCALE.length], 0.18, 0.05, "triangle", 1.01);
}

export function thud(power = 1) {
  tone(90 + Math.random() * 30, 0.25, Math.min(0.25, 0.05 + power * 0.12), "sine", 0.5);
}

export function chime() {
  [0, 2, 4].forEach((k, i) => window.setTimeout(() => tone(SCALE[k] * 2, 0.6, 0.05, "sine"), i * 90));
}

export function whoosh(dur = 0.9) {
  if (!on || !ctx || !master || !noise) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(200, t);
  bp.frequency.exponentialRampToValueAtTime(3200, t + dur * 0.7);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.18, t + dur * 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur);
}
