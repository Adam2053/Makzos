"use client";

import { useRef } from "react";
import { MOTION_OFF, MOTION_OK, POP, gsap, useGSAP } from "@/lib/motion";

/**
 * Pops children into place on scroll. The hidden start state lives in CSS
 * behind `html[data-js]`, so without JS nothing is ever hidden.
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
        gsap.set(el, { opacity: 0, y: 30, scale: 0.97 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          delay: delay / 1000,
          ease: POP,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      mm.add(MOTION_OFF, () => gsap.set(el, { opacity: 1, y: 0, scale: 1 }));
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
