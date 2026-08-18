"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Everything on this page moves on the same three curves. */
export const EASE = "power3.out";
export const EASE_SOFT = "sine.inOut";
/** A little overshoot — this theme should feel springy, not stately. */
export const POP = "back.out(1.5)";

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_OFF = "(prefers-reduced-motion: reduce)";

export { gsap, ScrollTrigger, useGSAP };
