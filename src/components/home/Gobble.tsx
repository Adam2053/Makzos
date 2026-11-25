"use client";

import { Fragment, useRef } from "react";
import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from "@/lib/motion";
import { CrunchMark } from "./CrunchMark";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Gobble.module.css";

/** What the usual bag carries: the words that get eaten (from the "Flash cut ingredients" artwork). */
const BAD = ["Palm oil", "MSG", "Maltodextrin", "Dextrose"];
/** What we stand by: the card flips through these once the bad words are gone. Lines already approved elsewhere on the page. */
const GOOD = ["Roasted, never fried", "No preservatives", "Made with makhana", "Flavours you know"];
/** Crumbs come off in the page's two colours: white letters, Paprika seed. */
const CRUMB = ["#ffffff", "#ea4b2b"];

/**
 * The "Nothing artificial" break. On a black band lit by soft Paprika glows, what the usual bag
 * carries sits in white, Paprika pellets between the words; our makhana runs along it like a
 * Pac-Man, its broken-off piece working as the jaw, eating letter by letter and pellet by pellet.
 * At the end of a line it leaves by the right edge and comes back in from the left on the next.
 * Full, it squashes, "Nothing artificial." rises where the words were and it hops up onto the
 * full stop; then a Paprika card under the title flips through the four things we stand by.
 * It loops for as long as the section is on screen.
 * Without motion (or before the script runs) the end state is simply there.
 */
export function Gobble() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const section = root.current as HTMLElement;
    const stage = q(`.${styles.stage}`)[0] as HTMLElement;
    const muncher = q(`.${styles.muncher}`)[0] as HTMLElement;
    const piece = q(`.${styles.piece}`);
    const burst = q(`.${styles.burst} path`);
    const items = q(`.${styles.fake} [data-l]`) as HTMLElement[];
    const lines = q(`.${styles.real} .${styles.line}`);
    const seat = q(`.${styles.seat}`)[0] as HTMLElement;
    const card = q(`.${styles.card}`)[0] as HTMLElement;
    const goods = q(`.${styles.good}`) as HTMLElement[];
    const glow = q(`.${styles.glow}`);
    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      const reset = () => {
        gsap.killTweensOf(piece);
        gsap.set(piece, { rotation: 0 });
        gsap.set(q(`.${styles.fake}`), { autoAlpha: 1 });
        gsap.set(items, { scale: 1, rotation: 0, autoAlpha: 1 });
        gsap.set([...lines, seat, card], { autoAlpha: 0 });
        gsap.set(goods, { autoAlpha: 0, rotationX: 0, yPercent: 0 });
        gsap.set(burst, { scale: 0, autoAlpha: 0 });
        gsap.set(glow, { opacity: 0.55, scale: 1 });
        gsap.set(muncher, { autoAlpha: 0, x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, transformOrigin: "0 0" });
      };
      reset();

      /** A few specks of the eaten letter's colour, thrown out of the mouth. */
      const crumbs = (el: HTMLElement) => {
        const box = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
        for (let i = 0; i < 3; i++) {
          const c = document.createElement("span");
          c.className = styles.crumb;
          c.style.background = CRUMB[i % CRUMB.length];
          c.style.left = `${r.left - box.left + r.width / 2}px`;
          c.style.top = `${r.top - box.top + r.height / 2}px`;
          stage.appendChild(c);
          gsap.timeline({ onComplete: () => c.remove() })
            .to(c, { x: gsap.utils.random(-50, 20), y: gsap.utils.random(-60, -20), duration: 0.28, ease: "power2.out" })
            .to(c, { y: "+=100", autoAlpha: 0, rotation: 160, duration: 0.5, ease: "power2.in" });
        }
      };

      const play = (): gsap.core.Timeline => {
        const box = stage.getBoundingClientRect();
        const band = section.getBoundingClientRect();
        const m = muncher.getBoundingClientRect();
        // The mouth is the gap at the seed's upper right: put that on the item's centre.
        const mouthX = (r: DOMRect) => r.left - box.left + r.width / 2 - m.width * 0.78;
        const mouthY = (r: DOMRect) => r.top - box.top + r.height / 2 - m.height * 0.45;
        // The tunnel: just past the band's right edge, and just before its left one.
        const offRight = band.right - box.left + 4;
        const offLeft = band.left - box.left - m.width - 4;
        const speed = Math.max(box.width / 1.6, 620); // px a second: a wide line in under two seconds, a phone no slower
        const chomp = gsap.to(piece, { rotation: -32, transformOrigin: "0% 100%", duration: 0.09, ease: "power1.inOut", yoyo: true, repeat: -1, paused: true });

        const tl = gsap.timeline();
        // `at` is where the makhana is in time: each bite pops off the timeline's spine, so the run never waits for it.
        let x = offLeft, rowTop = NaN, at = 0;
        const run = (toX: number) => {
          const d = Math.max(0.05, Math.abs(toX - x) / speed);
          tl.to(muncher, { x: toX, duration: d, ease: "none" }, at);
          x = toX; at += d;
        };
        tl.call(() => { chomp.play(); }, [], 0);
        items.forEach((el) => {
          const r = el.getBoundingClientRect();
          // A new line (pellets sit a touch lower than letters, so go by the line box, not the centre).
          if (Number.isNaN(rowTop) || r.top - rowTop > m.height * 0.5) {
            if (!Number.isNaN(rowTop)) run(offRight);
            rowTop = r.top;
            x = offLeft;
            tl.set(muncher, { x, y: mouthY(r), autoAlpha: 1 }, at);
          }
          run(mouthX(r));
          tl.to(el, { scale: 0, rotation: gsap.utils.random(-40, 40), autoAlpha: 0, duration: 0.13, ease: "back.in(2)" }, at - 0.04)
            .call(() => crumbs(el), [], at - 0.04);
        });
        tl.set({}, {}, at);

        // Full: the jaw shuts, a happy squash and the burst lines pop.
        tl.call(() => { chomp.kill(); gsap.to(piece, { rotation: 0, duration: 0.2 }); })
          .to(muncher, { scaleX: 1.08, scaleY: 0.9, duration: 0.12, ease: "power2.in" })
          .to(muncher, { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" })
          .fromTo(burst, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, stagger: 0.05, ease: "back.out(3)" }, "<")
          // "Nothing artificial." rises where the words were eaten.
          .to(glow, { opacity: 1, scale: 1.08, duration: 1.2, ease: "power2.out" }, "<")
          .fromTo(lines, { yPercent: 35, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12, ease: "power3.out" }, "-=0.3")
          // The makhana hops up onto the full stop and hands over to the one that stays.
          .to(muncher, {
            x: () => seat.getBoundingClientRect().left - stage.getBoundingClientRect().left,
            y: () => seat.getBoundingClientRect().top - stage.getBoundingClientRect().top,
            scale: () => seat.getBoundingClientRect().width / m.width,
            duration: 0.7, ease: "back.out(1.6)",
          }, "-=0.4")
          .set(seat, { autoAlpha: 1 })
          .set(muncher, { autoAlpha: 0 })
          // Then the good things: the card drops in on the first, and flips over to each of the others.
          .set(goods[0], { autoAlpha: 1 })
          .fromTo(card, { autoAlpha: 0, y: 16, rotationX: -40 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.55, ease: "back.out(1.8)" }, "-=0.1");
        for (let i = 1; i < goods.length; i++) {
          tl.to(goods[i - 1], { rotationX: 90, yPercent: -20, autoAlpha: 0, duration: 0.22, ease: "power2.in" }, "+=1.1")
            .fromTo(goods[i], { rotationX: -90, yPercent: 20, autoAlpha: 1 }, { rotationX: 0, yPercent: 0, duration: 0.45, ease: "back.out(2.2)" });
        }
        return tl;
      };

      /*
       * The loop: hold the last good thing for a beat, put the eaten words back, and go again.
       * It only runs while the section is on screen; scrolled away, the current round pauses
       * where it is and picks up when it's back.
       */
      let round: gsap.core.Timeline | null = null;
      const loop = () => {
        round = play();
        round.to({}, { duration: 1.8 })
          .to([...lines, seat, card], { autoAlpha: 0, duration: 0.4, ease: "power2.in" })
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
    <section ref={root} className={styles.section} aria-labelledby="gobble-title">
      {/* Blurred Paprika light behind the words; it warms up when the answer lands. */}
      <div className={styles.glow} aria-hidden="true" />
      <div className={ui.shell}>
        <div className={styles.stage}>
          {/* What gets eaten. Decoration only: the heading and the list below are what's announced. */}
          <p className={`${ui.display} ${styles.fake}`} aria-hidden="true">
            {BAD.map((w, i) => (
              <Fragment key={w}>
                {i > 0 && <span className={styles.pellet} data-l />}
                <span className={styles.fakeWord}>
                  {[...w].map((ch, j) => <span key={j} data-l>{ch}</span>)}
                </span>
              </Fragment>
            ))}
          </p>

          <div className={styles.real}>
            <h2 id="gobble-title" className={`${ui.display} ${styles.title}`}>
              <span className={styles.line}>Nothing</span>
              <span className={`${styles.line} ${styles.outline}`}>
                artificial.
                <Makhana variant="fill" className={styles.seat} />
              </span>
            </h2>
            <p className={styles.card}>
              {GOOD.map((g) => <span key={g} className={styles.good}>{g}</span>)}
            </p>
          </div>

          <CrunchMark variant="fill" className={styles.muncher}
            partClass={{ main: styles.part, piece: `${styles.part} ${styles.piece}`, burst: `${styles.part} ${styles.burst}`, crumbs: styles.part }} />
        </div>
      </div>
      <p className={ui.sr}>No palm oil, MSG, maltodextrin or dextrose. {GOOD.join(". ")}.</p>
    </section>
  );
}
