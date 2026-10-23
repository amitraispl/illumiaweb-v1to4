"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Observer } from "gsap/Observer";
import { TextPlugin } from "gsap/TextPlugin";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, Observer, TextPlugin, Flip);
}

export const reducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const finePointer = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

/** Shared curves, measured on award sites: strong ease-outs, in-outs only for wipes. */
export const ease = {
  out: "expo.out",
  soft: "power3.out",
  wipe: "power4.inOut",
  exit: "power2.in",
} as const;

export { gsap, ScrollTrigger, SplitText, Flip, Observer, useGSAP };
