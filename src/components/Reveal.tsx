"use client";

import { useRef } from "react";
import { EASE, MOTION_OFF, MOTION_OK, gsap, useGSAP } from "@/lib/motion";

/**
 * Lifts children into place as they enter the viewport. The hidden start state
 * lives in CSS behind `html[data-js]`, so without JS nothing is ever hidden.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  as?: React.ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.set(el, { opacity: 0, y: 26 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          delay: delay / 1000,
          ease: EASE,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      mm.add(MOTION_OFF, () => {
        gsap.set(el, { opacity: 1, y: 0 });
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [delay] },
  );

  return (
    <Tag ref={ref} className={className} data-reveal="">
      {children}
    </Tag>
  );
}
