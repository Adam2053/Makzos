"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Everything on this page moves on the same two curves. */
export const EASE = "power3.out";
export const EASE_SOFT = "sine.inOut";

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_OFF = "(prefers-reduced-motion: reduce)";

export { gsap, ScrollTrigger, useGSAP };
