"use client";

import { useRef } from "react";
import { MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import ui from "./ui.module.css";
import styles from "./FlashCut.module.css";

/** What the usual bag carries: the white squares, each struck through (from the "Flash cut ingredients" artwork). */
const CUT = ["Palm oil", "MSG", "Maltodextrin", "TBHQ\nINS 319", "Dextrose", "BHA\nINS 320", "I+G\nINS 635", "Sugar syrup"];
/** What we say instead: the black squares flip over to these, Paprika side up. Only lines already approved elsewhere on the page. */
const USP = ["Nothing artificial", "Roasted, never fried", "No preservatives", "Nothing unnecessary", "Made with makhana", "No INS-coded additives", "Flavours you know", "Nothing we wouldn't explain"];

/**
 * Where each square sits: a checkerboard of 8 x 2 on wide screens, 4 x 4 on phones. White
 * (struck-through) squares land where row + column is even, Paprika ones where it's odd.
 */
const spots = (cols: number, rows: number, even: boolean) => {
  const out: { c: number; r: number }[] = [];
  for (let r = 1; r <= rows; r++) for (let c = 1; c <= cols; c++) if (((r + c) % 2 === 0) === even) out.push({ c, r });
  return out;
};
const WIDE = { cut: spots(8, 2, true), usp: spots(8, 2, false) };
const NARROW = { cut: spots(4, 4, true), usp: spots(4, 4, false) };
/** Each strike leans its own way, like a pen across a label. */
const LEAN = [-4, 3, -2, -24, 2, -22, -26, -3];

const place = (i: number, set: "cut" | "usp") =>
  ({ "--c": WIDE[set][i].c, "--r": WIDE[set][i].r, "--mc": NARROW[set][i].c, "--mr": NARROW[set][i].r }) as React.CSSProperties;

/**
 * The "Nothing artificial" break between the comparison and the reviews: a white and Paprika
 * checkerboard. First a red pen strikes through what the usual bag carries, square by square;
 * then the Paprika squares flip over like a flip clock, one after another, and each lands on
 * something we stand by. It holds, clears and goes again for as long as it's on screen.
 * Without motion (or before the script runs) the end state is simply there.
 */
export function FlashCut() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const strikes = q(`.${styles.strike}`);
      const flaps = q(`.${styles.flapTop}`);
      const falls = q(`.${styles.flapBottom}`);
      const fresh = q(`.${styles.freshTop}`);

      // Start from the blank board: nothing struck yet, every flip square showing its black face.
      gsap.set(strikes, { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(flaps, { rotationX: 0, filter: "brightness(1)" });
      gsap.set(falls, { rotationX: 90 });
      gsap.set(fresh, { autoAlpha: 0 });

      const n = USP.length;
      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.4 });
      // 1. The pen goes through what the usual bag carries, one square after another.
      tl.to(strikes, { scaleX: 1, duration: 0.32, stagger: 0.14, ease: "power3.inOut" }, 0.3);
      // 2. The flip clock: the top half of each blank square tips down over the hinge, darkening
      //    as it goes, then the bottom half of the new face falls into place and bounces on the stop.
      USP.forEach((_, i) => {
        const at = 1.8 + i * 0.16;
        tl.set(fresh[i], { autoAlpha: 1 }, at)
          .to(flaps[i], { rotationX: -90, filter: "brightness(.7)", duration: 0.22, ease: "power2.in" }, at)
          .to(falls[i], { rotationX: 0, duration: 0.42, ease: "bounce.out" }, at + 0.22);
      });
      // 3. Hold, then clear the board for the next round: the squares flip back the way they came,
      //    last first, and the strikes lift off to the right.
      const hold = 1.8 + n * 0.16 + 3.2;
      USP.forEach((_, i) => {
        const at = hold + (n - 1 - i) * 0.08;
        tl.to(falls[i], { rotationX: 90, duration: 0.16, ease: "power2.in" }, at)
          .to(flaps[i], { rotationX: 0, filter: "brightness(1)", duration: 0.22, ease: "power2.out" }, at + 0.16)
          .set(fresh[i], { autoAlpha: 0 }, at + 0.38);
      });
      tl.set(strikes, { transformOrigin: "100% 50%" }, hold)
        .to(strikes, { scaleX: 0, duration: 0.3, stagger: 0.05, ease: "power2.in" }, hold + 0.1)
        .set(strikes, { transformOrigin: "0% 50%" });

      // It runs only while it's on screen, and picks up where it left off.
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) tl.play(); else tl.pause(); }, { threshold: 0.3 });
      if (root.current) io.observe(root.current);
      return () => io.disconnect();
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} className={styles.band} aria-label="Nothing artificial">
      <div className={styles.board} aria-hidden="true">
        {CUT.map((t, i) => (
          <div key={t} className={styles.cut} style={{ ...place(i, "cut"), "--lean": `${LEAN[i]}deg` } as React.CSSProperties}>
            <span className={styles.word} data-long={t.split("\n").some((l) => l.length > 10) || undefined}>
              {t.split("\n").map((l) => <span key={l}>{l}</span>)}
              <span className={styles.strike} />
            </span>
          </div>
        ))}
        {USP.map((t, i) => (
          <div key={t} className={styles.usp} style={place(i, "usp")}>
            {/* Four halves make the flip: the new face's top waits behind, the blank face's
                bottom stays put, the blank top tips down over the hinge, the new bottom falls. */}
            <span className={`${styles.half} ${styles.top} ${styles.freshTop}`}><span className={styles.face}>{t}</span></span>
            <span className={`${styles.half} ${styles.bottom} ${styles.blank}`}><span className={styles.face} /></span>
            <span className={`${styles.half} ${styles.top} ${styles.flapTop} ${styles.blank}`}><span className={styles.face} /></span>
            <span className={`${styles.half} ${styles.bottom} ${styles.flapBottom}`}><span className={styles.face}>{t}</span></span>
          </div>
        ))}
      </div>
      <p className={ui.sr}>
        No palm oil, MSG, maltodextrin or INS-coded additives. Nothing artificial. Nothing unnecessary.
      </p>
    </section>
  );
}
