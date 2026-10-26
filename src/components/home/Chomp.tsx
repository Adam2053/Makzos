"use client";

import { useRef } from "react";
import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from "@/lib/motion";
import { CrunchMark } from "./CrunchMark";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Chomp.module.css";

/** The words that get eaten. */
const FAKE = ["Artificial", "flavours"];
/** Crumbs come off in the page's two colours: white letters, Paprika seed. */
const CRUMB = ["#ffffff", "#ea4b2b"];

/**
 * The break between the comparison and the box builder. "Artificial flavours" sits on a black
 * band lit by soft Paprika glows; our makhana chomps through it letter by letter, its broken-off
 * piece working as the jaw; then "Nothing artificial." rises in its place and the makhana
 * hops up to sit on the full stop. It loops for as long as the section is on screen.
 * Without motion (or before the script runs) the end state is simply there.
 */
export function Chomp() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const stage = q(`.${styles.stage}`)[0] as HTMLElement;
    const muncher = q(`.${styles.muncher}`)[0] as HTMLElement;
    const piece = q(`.${styles.piece}`);
    const burst = q(`.${styles.burst} path`);
    const letters = q(`.${styles.fake} [data-l]`) as HTMLElement[];
    const lines = q(`.${styles.real} .${styles.line}`);
    const seat = q(`.${styles.seat}`)[0] as HTMLElement;
    const after = q(`.${styles.after}`);
    const glow = q(`.${styles.glow}`);
    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      gsap.set(q(`.${styles.fake}`), { autoAlpha: 1 });
      gsap.set([...lines, seat, ...after], { autoAlpha: 0 });
      gsap.set(glow, { opacity: 0.55 });
      gsap.set(muncher, { autoAlpha: 0, transformOrigin: "0 0" });

      /** A few specks of the eaten letter's colour, thrown out of the mouth. */
      const crumbs = (el: HTMLElement) => {
        const box = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
        for (let i = 0; i < 4; i++) {
          const c = document.createElement("span");
          c.className = styles.crumb;
          c.style.background = CRUMB[i % CRUMB.length];
          c.style.left = `${r.left - box.left + r.width / 2}px`;
          c.style.top = `${r.top - box.top + r.height / 2}px`;
          stage.appendChild(c);
          gsap.timeline({ onComplete: () => c.remove() })
            .to(c, { x: gsap.utils.random(-50, 30), y: gsap.utils.random(-70, -20), duration: 0.3, ease: "power2.out" })
            .to(c, { y: "+=110", autoAlpha: 0, rotation: 160, duration: 0.5, ease: "power2.in" });
        }
      };

      const play = (): gsap.core.Timeline => {
        const box = stage.getBoundingClientRect();
        const m = muncher.getBoundingClientRect();
        // The mouth is the gap at the seed's upper right: put that on the letter's centre.
        const mouthAt = (el: HTMLElement) => {
          const r = el.getBoundingClientRect();
          return { x: r.left - box.left + r.width / 2 - m.width * 0.78, y: r.top - box.top + r.height / 2 - m.height * 0.45 };
        };
        const speed = Math.max(box.width / 2.6, 480); // px a second: a wide line in under three seconds, a phone no slower
        const first = mouthAt(letters[0]);
        const chomp = gsap.to(piece, { rotation: -32, transformOrigin: "0% 100%", duration: 0.09, ease: "power1.inOut", yoyo: true, repeat: -1, paused: true });

        const tl = gsap.timeline();
        tl.set(muncher, { x: first.x - m.width * 1.4, y: first.y, scale: 1 })
          .to(muncher, { autoAlpha: 1, duration: 0.2 })
          .call(() => { chomp.play(); });
        let from = { x: first.x - m.width * 1.4, y: first.y };
        letters.forEach((el) => {
          const to = mouthAt(el);
          const d = Math.hypot(to.x - from.x, to.y - from.y);
          tl.to(muncher, { x: to.x, y: to.y, duration: Math.max(0.07, d / speed), ease: "none" })
            .to(el, { scale: 0, rotation: gsap.utils.random(-40, 40), autoAlpha: 0, duration: 0.14, ease: "back.in(2)" }, "-=0.05")
            .call(() => crumbs(el), [], "<");
          from = to;
        });

        // Full: the jaw shuts, a happy squash and the burst lines pop.
        tl.call(() => { chomp.kill(); gsap.to(piece, { rotation: 0, duration: 0.2 }); })
          .to(muncher, { scaleX: 1.08, scaleY: 0.9, duration: 0.12, ease: "power2.in" })
          .to(muncher, { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" })
          .fromTo(burst, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, stagger: 0.05, ease: "back.out(3)" }, "<")
          // The new line rises where the old one was eaten.
          .to(glow, { opacity: 1, scale: 1.08, duration: 1.2, ease: "power2.out" }, "<")
          .fromTo(lines, { yPercent: 35, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12, ease: "power3.out" }, "-=0.3")
          // Then the makhana hops up onto the full stop and hands over to the one that stays.
          .to(muncher, {
            x: () => seat.getBoundingClientRect().left - stage.getBoundingClientRect().left,
            y: () => seat.getBoundingClientRect().top - stage.getBoundingClientRect().top,
            scale: () => seat.getBoundingClientRect().width / m.width,
            duration: 0.7, ease: "back.out(1.6)",
          }, "-=0.4")
          .set(seat, { autoAlpha: 1 })
          .set(muncher, { autoAlpha: 0 })
          .fromTo(after, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.2");
        return tl;
      };

      /*
       * The loop: hold the answer for a beat, put the eaten words back, and chomp again. It
       * only runs while the section is on screen; scrolled away, the current round pauses
       * where it is and picks up when it's back.
       */
      let round: gsap.core.Timeline | null = null;
      const reset = () => {
        gsap.killTweensOf(piece);
        gsap.set(piece, { rotation: 0 });
        gsap.set(letters, { scale: 1, rotation: 0, autoAlpha: 1 });
        gsap.set([...lines, seat, ...after], { autoAlpha: 0 });
        gsap.set(burst, { scale: 0, autoAlpha: 0 });
        gsap.set(glow, { opacity: 0.55, scale: 1 });
        gsap.set(muncher, { autoAlpha: 0, scale: 1, scaleX: 1, scaleY: 1 });
      };
      const loop = () => {
        round = play();
        round.to({}, { duration: 2.6 })
          .to([...lines, seat, ...after], { autoAlpha: 0, duration: 0.4, ease: "power2.in" })
          .call(() => { reset(); loop(); });
      };
      const st = ScrollTrigger.create({
        trigger: stage, start: "top 75%", end: "bottom 10%",
        onToggle: (self) => {
          if (!self.isActive) round?.pause();
          else if (round) round.resume();
          else loop();
        },
      });
      return () => { st.kill(); round?.kill(); };
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} className={styles.section} aria-labelledby="chomp-title">
      {/* Blurred Paprika light behind the words; it warms up when the answer lands. */}
      <div className={styles.glow} aria-hidden="true" />
      <div className={ui.shell}>
        <div className={styles.stage}>
          {/* What gets eaten. Decoration only: the heading below is what's announced. */}
          <p className={`${ui.display} ${styles.fake}`} aria-hidden="true">
            {FAKE.map((w) => (
              <span key={w} className={styles.fakeWord}>
                {[...w].map((ch, i) => <span key={i} data-l>{ch}</span>)}
              </span>
            ))}
          </p>

          <h2 id="chomp-title" className={`${ui.display} ${styles.real}`}>
            <span className={styles.line}>Nothing</span>
            <span className={`${styles.line} ${styles.outline}`}>
              artificial.
              <Makhana variant="fill" className={styles.seat} />
            </span>
          </h2>

          <CrunchMark variant="fill" className={styles.muncher}
            partClass={{ main: styles.part, piece: `${styles.part} ${styles.piece}`, burst: `${styles.part} ${styles.burst}`, crumbs: styles.part }} />
        </div>
        <p className={styles.after}>No preservatives. No artificial colours or flavours. Not even a crumb.</p>
      </div>
    </section>
  );
}
