"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { EASE, EASE_SOFT, MOTION_OFF, MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { FlapBoard } from "./FlapBoard";
import { PuffField } from "./PuffField";
import { FLAVOURS } from "@/lib/flavours";
import styles from "./LaunchHero.module.css";

const STATES = [
  "Kerala", "Punjab", "Assam", "Maharashtra", "Tamil Nadu", "Rajasthan", "West Bengal", "Goa",
  "Karnataka", "Arunachal Pradesh", "Gujarat", "Odisha", "Uttar Pradesh", "Sikkim", "Telangana",
  "Bihar", "Himachal Pradesh", "Meghalaya", "Madhya Pradesh", "Nagaland", "Andhra Pradesh",
  "Jharkhand", "Manipur", "Haryana", "Tripura", "Uttarakhand", "Mizoram", "Chhattisgarh",
];

/** The wordmark as single glyphs; widths are each cut's share of the 1200px logo. */
const LETTERS = [
  { id: "m", width: 225, tilt: -28 },
  { id: "a", width: 170, tilt: 22 },
  { id: "k", width: 173, tilt: -14 },
  { id: "z", width: 174, tilt: 31 },
  { id: "o", width: 246, tilt: 0 },
  { id: "s", width: 212, tilt: -20 },
];

/**
 * The opening: one word per pack colour, each bursting open in turn. It ends on Chettinadu amber,
 * which is the page itself.
 */
const BURSTS = [
  { word: "We", flavour: "mac-cheese" },
  { word: "are", flavour: "curry-leaves" },
  { word: "launching", flavour: "thai-chilli" },
  { word: "soon", flavour: "chettinadu" },
].map(({ word, flavour }) => ({ word, ...FLAVOURS.find((f) => f.id === flavour)! }));

/** A lumpy makhana outline for the cursor, fixed so server and client agree. */
function lumpyPath(cx: number, cy: number, r: number) {
  const offs = [0.05, -0.04, 0.06, -0.02, 0.04, -0.05, 0.03, -0.03, 0.06, -0.04, 0.02];
  const pts = offs.map((o, i) => {
    const a = (i / offs.length) * Math.PI * 2;
    return [cx + Math.cos(a) * r * (1 + o), cy + Math.sin(a) * r * (1 + o)];
  });
  const mid = (i: number) => {
    const [ax, ay] = pts[i % pts.length], [bx, by] = pts[(i + 1) % pts.length];
    return `${((ax + bx) / 2).toFixed(1)} ${((ay + by) / 2).toFixed(1)}`;
  };
  let d = `M${mid(0)}`;
  for (let i = 1; i <= pts.length; i++) {
    const [px, py] = pts[i % pts.length];
    d += ` Q${px.toFixed(1)} ${py.toFixed(1)} ${mid(i)}`;
  }
  return `${d}Z`;
}

function MakhanaCursor() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path d={lumpyPath(50, 50, 44)} fill="#f0eae0" />
      <path d={lumpyPath(47, 46, 35)} fill="#0f0e0c" />
      <g fill="#f0eae0">
        <ellipse cx="36" cy="44" rx="4" ry="6" />
        <ellipse cx="50" cy="42" rx="4" ry="6" />
        <ellipse cx="35" cy="58" rx="4.5" ry="3" />
        <ellipse cx="48" cy="59" rx="6" ry="3" />
      </g>
    </svg>
  );
}

export function LaunchHero() {
  const root = useRef<HTMLElement>(null);
  const [landed, setLanded] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOTION_OFF);
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const glyphs = q(`.${styles.glyph}:not(.${styles.o}) img`);
        const mark = q(`.${styles.o} img`);

        const bursts = q(`.${styles.burst}`);
        const names = q(`.${styles.flavour}`);
        const intro = gsap.timeline({ delay: 0.15 });

        // Each colour pops open from the centre, carrying the next word.
        bursts.forEach((burst, i) => {
          const at = i * 0.5;
          intro
            .fromTo(burst, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 0.7, ease: "power4.out" }, at)
            .fromTo(names[i], { scale: 1.35, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: "power3.out" }, at + 0.05);
        });

        intro
          .to(names[names.length - 1], { yPercent: -60, opacity: 0, duration: 0.45, ease: "power3.in" }, "+=0.15")
          .set(q(`.${styles.bursts}`), { autoAlpha: 0 })
          // The letters fall into place one after another...
          .from(glyphs, {
            y: () => -window.innerHeight * 1.1,
            rotation: (i) => LETTERS.filter((l) => l.id !== "o")[i].tilt,
            duration: 1.1,
            ease: "bounce.out",
            stagger: 0.09,
          }, "-=0.1")
          // ...and the makhana drops last, spinning, into the gap left for it.
          .from(mark, { y: () => -window.innerHeight * 1.3, rotation: -540, duration: 0.85, ease: "power2.in" }, "-=0.35")
          .addLabel("settled")
          .to(mark, { scaleX: 1.22, scaleY: 0.74, duration: 0.09, ease: "power2.out", transformOrigin: "50% 100%" }, "settled")
          .to(mark, { scaleX: 1, scaleY: 1, duration: 0.9, ease: "elastic.out(1.1, 0.35)" }, "settled+=0.09")
          // The landing knocks its neighbours off the ground for a moment.
          .to(glyphs, { y: (i) => -[14, 22, 34, 48, 40][i], rotation: (i) => [-3, 2, -4, 5, -6][i], duration: 0.16, ease: "power2.out" }, "settled")
          .to(glyphs, { y: 0, rotation: 0, duration: 0.6, ease: "bounce.out" }, "settled+=0.16")
          .call(() => setLanded(true), [], "settled+=0.2")
          .from(q(`.${styles.reveal}`), { opacity: 0, y: 16, duration: 0.8, ease: EASE, stagger: 0.12 }, "settled+=0.5");

        intro.to(mark, { rotation: 6, duration: 1.8, repeat: -1, yoyo: true, ease: EASE_SOFT }, "settled+=1.1");

        // Letters lean toward a nearby pointer; the cursor is a makhana that tilts as it travels.
        const movers = q(`.${styles.glyph}`).map((g) => ({
          el: g,
          x: gsap.quickTo(g, "x", { duration: 0.6, ease: "power3.out" }),
          y: gsap.quickTo(g, "y", { duration: 0.6, ease: "power3.out" }),
          r: gsap.quickTo(g, "rotation", { duration: 0.8, ease: "power3.out" }),
        }));
        const cursor = q(`.${styles.cursor}`)[0];
        const puff = cursor.firstElementChild as HTMLElement;
        const cx = gsap.quickTo(cursor, "x", { duration: 0.3, ease: "power3.out" });
        const cy = gsap.quickTo(cursor, "y", { duration: 0.3, ease: "power3.out" });
        const tilt = gsap.quickTo(puff, "rotation", { duration: 0.5, ease: "power3.out" });
        let lastX = 0;

        const onMove = (e: PointerEvent) => {
          cursor.classList.add(styles.seen);
          cx(e.clientX);
          cy(e.clientY);
          tilt(gsap.utils.clamp(-40, 40, (e.clientX - lastX) * 2.5));
          lastX = e.clientX;
          if (intro.time() < intro.labels.settled + 0.8) return;
          let near = false;
          for (const m of movers) {
            const box = m.el.getBoundingClientRect();
            const dx = e.clientX - (box.left + box.width / 2), dy = e.clientY - (box.top + box.height / 2);
            const reach = box.height * 1.4, pull = Math.max(0, 1 - Math.hypot(dx, dy) / reach);
            near ||= pull > 0.4;
            m.x(dx * pull * 0.35);
            m.y(dy * pull * 0.35);
            m.r(dx * pull * 0.05);
          }
          cursor.classList.toggle(styles.big, near);
        };
        const onDown = () =>
          gsap.fromTo(puff, { scaleX: 1.35, scaleY: 0.65 }, { scaleX: 1, scaleY: 1, duration: 0.7, ease: "elastic.out(1.2, 0.35)" });
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerdown", onDown);
        return () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerdown", onDown);
        };
      });

      mm.add(MOTION_OFF, () => setLanded(true));
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <main ref={root} className={styles.page}>
      <PuffField active={landed} still={still} />

      <div className={styles.stage}>
        <p className={`${styles.top} ${styles.reveal}`}>We are coming soon</p>

        <h1 className={styles.word}>
          <span className={styles.sr}>Makzo&rsquo;s</span>
          {LETTERS.map((l) => (
            <span
              key={l.id}
              className={l.id === "o" ? `${styles.glyph} ${styles.o}` : styles.glyph}
              style={{ width: `${(l.width / 1200) * 100}%` }}
            >
              <Image src={`/brand/letter-${l.id}.png`} alt="" width={l.width} height={296} priority />
            </span>
          ))}
        </h1>

        <div className={styles.bottom}>
          <div className={`${styles.panel} ${styles.reveal}`}>
            <p className={styles.label}>Launching soon in</p>
            <FlapBoard words={STATES} active={landed} still={still} />
            <p className={styles.sr}>Launching soon across India.</p>
          </div>
          <p className={`${styles.panel} ${styles.hint} ${styles.reveal}`}>Tap or click anywhere to pop a few more.</p>
        </div>
      </div>

      <div className={styles.bursts} aria-hidden="true">
        {BURSTS.map((f) => (
          <div key={f.id} className={styles.burst} style={{ background: f.id === "chettinadu" ? undefined : f.accent }}>
            <p className={styles.flavour} style={{ color: f.deep }}>{f.word}</p>
          </div>
        ))}
      </div>

      <div className={styles.cursor} aria-hidden="true">
        <span><MakhanaCursor /></span>
      </div>
    </main>
  );
}
