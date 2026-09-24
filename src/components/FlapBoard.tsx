"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion";
import styles from "./FlapBoard.module.css";

const FLAPS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const HOLD = 1.1;

/**
 * A railway-station split-flap board. Each cell rattles through a few letters before landing,
 * left to right, then the board holds and moves on to the next name.
 */
export function FlapBoard({ words, active, still }: { words: string[]; active: boolean; still: boolean }) {
  const cells = Math.max(...words.map((w) => w.length));
  const board = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const els = Array.from(board.current!.querySelectorAll<HTMLSpanElement>(`.${styles.char}`));
    const write = (word: string) => els.forEach((el, i) => (el.textContent = word.toUpperCase()[i] ?? " "));

    if (still) {
      write(words[0]);
      return;
    }

    let index = 0;
    let tl: gsap.core.Timeline | null = null;
    const show = () => {
      const target = words[index % words.length].toUpperCase().padEnd(cells, " ");
      index++;
      tl = gsap.timeline({ onComplete: () => void (tl = gsap.timeline().call(show, [], HOLD)) });
      els.forEach((el, i) => {
        if (el.textContent === target[i]) return;
        const turns = 2 + ((i * 7 + index) % 3);
        const flap = gsap.timeline();
        for (let t = 0; t <= turns; t++) {
          const letter = t === turns ? target[i] : FLAPS[(i * 5 + t * 11 + index * 3) % FLAPS.length];
          flap
            .to(el, { scaleY: 0, duration: 0.03, ease: "power1.in" })
            .call(() => void (el.textContent = letter))
            .to(el, { scaleY: 1, duration: 0.03, ease: "power1.out" });
        }
        tl!.add(flap, i * 0.025);
      });
    };
    show();

    return () => {
      tl?.kill();
      gsap.killTweensOf(els);
    };
  }, [active, still, words, cells]);

  return (
    <div ref={board} className={styles.board} aria-hidden="true">
      {Array.from({ length: cells }, (_, i) => (
        <span key={i} className={styles.cell}>
          <span className={styles.char}> </span>
        </span>
      ))}
    </div>
  );
}
