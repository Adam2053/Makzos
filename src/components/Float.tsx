"use client";

import { useRef } from "react";
import { EASE_SOFT, MOTION_OK, gsap, useGSAP } from "@/lib/motion";

/**
 * A slow vertical drift for cards. Floats a wrapper rather than the card itself
 * so the card keeps its own CSS hover transform.
 */
export function Float({
  children,
  delay = 0,
  amount = 8,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.to(ref.current, {
          y: -amount,
          duration: 2.8,
          ease: EASE_SOFT,
          yoyo: true,
          repeat: -1,
          delay,
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [delay, amount] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
