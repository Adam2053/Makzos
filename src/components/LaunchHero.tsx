"use client";

import Image from "next/image";
import { useRef } from "react";
import { EASE, MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { createTorch, type Beam } from "@/lib/torch";
import styles from "./LaunchHero.module.css";

/** The wordmark as single glyphs; widths are each cut's share of the 1200px logo. */
const LETTERS = [
  { id: "m", width: 225 },
  { id: "a", width: 170 },
  { id: "k", width: 173 },
  { id: "z", width: 174 },
  { id: "o", width: 246 },
  { id: "s", width: 212 },
];

/** Hidden in the dark, found only by torchlight: [name, left %, top %, rotation, size in rem]. */
const HIDDEN_STATES: [string, number, number, number, number][] = [
  ["Kerala", 7, 13, -8, 2.6], ["Punjab", 70, 8, 6, 2.2], ["Assam", 86, 26, -12, 1.8],
  ["Goa", 31, 7, 10, 1.6], ["Tamil Nadu", 5, 74, 7, 2.3], ["Maharashtra", 57, 84, -5, 2.6],
  ["Rajasthan", 38, 91, 4, 1.7], ["West Bengal", 77, 69, 9, 2], ["Sikkim", 50, 19, -4, 1.4],
  ["Gujarat", 17, 33, 12, 1.5], ["Odisha", 86, 90, -9, 1.6], ["Karnataka", 20, 86, -11, 1.9],
  ["Telangana", 63, 29, 7, 1.3], ["Himachal Pradesh", 30, 71, -3, 1.3], ["Meghalaya", 88, 47, -90, 1.3],
  ["Nagaland", 3, 44, 90, 1.3],
];

/** A few makhana doodles tucked into corners: [left %, top %, rotation, size in rem]. */
const HIDDEN_PUFFS: [number, number, number, number][] = [
  [14, 22, 20, 5.5], [80, 14, -15, 4.5], [91, 76, 30, 6], [46, 74, -8, 3.8], [8, 88, 12, 4.8], [42, 27, -25, 3.4],
];

function Puff() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <path d="M50 6 Q70 5 82 18 Q97 32 94 52 Q93 74 76 87 Q58 98 38 93 Q15 87 8 66 Q2 44 14 26 Q28 7 50 6Z" fill="#f0eae0" />
      <path d="M47 15 Q64 13 75 25 Q86 38 83 53 Q80 70 65 78 Q49 85 33 78 Q18 70 15 53 Q13 34 25 23 Q34 15 47 15Z" fill="#0f0e0c" />
      <g fill="#f0eae0">
        <ellipse cx="38" cy="44" rx="4" ry="6" /><ellipse cx="52" cy="42" rx="4" ry="6" />
        <ellipse cx="37" cy="59" rx="4.5" ry="3" /><ellipse cx="50" cy="60" rx="6" ry="3" />
      </g>
    </svg>
  );
}

export function LaunchHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const fine = window.matchMedia("(pointer: fine)").matches;
        const canvas = q(`.${styles.dark}`)[0] as HTMLCanvasElement;
        const torch = createTorch(canvas);
        const baseR = () => gsap.utils.clamp(170, 360, Math.min(innerWidth, innerHeight) * 0.32);
        const beam: Beam = { x: innerWidth / 2, y: innerHeight * 0.46, r: 0 };
        // Where the torch wants to be; the beam eases toward it every frame.
        const aim = { x: beam.x, y: beam.y };
        let mode: "intro" | "pointer" | "roam" = "intro";
        let idleTimer = 0;

        const word = q(`.${styles.word}`)[0];
        const secrets = q(`.${styles.secrets}`)[0];
        const setWord = { x: gsap.quickSetter(word, "x", "px"), y: gsap.quickSetter(word, "y", "px") };
        const setSecrets = { x: gsap.quickSetter(secrets, "x", "px"), y: gsap.quickSetter(secrets, "y", "px") };

        // Hidden things only exist in the light: fade each by its distance from the beam.
        // Centres are measured without parallax; the tick adds the current shift back in.
        const hidden = q(`.${styles.secret}, .${styles.puff}`).map((el) => ({ el, cx: 0, cy: 0, set: gsap.quickSetter(el, "opacity") }));
        let shift = { x: 0, y: 0 };
        const measure = () => {
          for (const h of hidden) {
            const box = h.el.getBoundingClientRect();
            h.cx = box.left + box.width / 2 - shift.x;
            h.cy = box.top + box.height / 2 - shift.y;
          }
        };
        measure();

        const tick = (time: number, deltaMs: number) => {
          const dt = Math.min(deltaMs, 50) / 1000;
          if (mode === "roam") {
            // A slow figure-of-eight when nobody is holding the torch.
            aim.x = innerWidth / 2 + Math.sin(time * 0.4) * innerWidth * 0.34;
            aim.y = innerHeight * 0.5 + Math.sin(time * 0.8) * innerHeight * 0.26;
          }
          if (mode !== "intro") {
            // Frame-rate independent easing, so it glides the same at 60Hz and 120Hz.
            const k = 1 - Math.exp(-dt * (mode === "roam" ? 1.6 : 7));
            beam.x += (aim.x - beam.x) * k;
            beam.y += (aim.y - beam.y) * k;
          }
          torch.draw(beam, time, dt);
          // The room shifts against the torch for depth; hidden words sit nearer than the name.
          const dx = (beam.x - innerWidth / 2) / innerWidth, dy = (beam.y - innerHeight / 2) / innerHeight;
          setWord.x(dx * -20);
          setWord.y(dy * -12);
          shift = { x: dx * -56, y: dy * -36 };
          setSecrets.x(shift.x);
          setSecrets.y(shift.y);
          for (const h of hidden) {
            const d = Math.hypot(h.cx + shift.x - beam.x, h.cy + shift.y - beam.y);
            h.set(1 - gsap.utils.clamp(0, 1, (d - beam.r * 0.45) / (beam.r * 0.45)));
          }
        };
        gsap.ticker.add(tick);

        // The name is not there at first: the torch flickers on to an empty room, then the
        // letters rise into the light, centre first, and the beam opens up to take it all in.
        const glyphs = q(`.${styles.glyph}`);
        gsap.set(glyphs, { yPercent: 70, opacity: 0, scale: 0.86 });
        const flicker: [number, number][] = [[0, 0.5], [0.07, 0], [0.15, 0.25], [0.21, 0], [0.34, 0.9], [0.41, 0.3], [0.48, 1]];
        const intro = gsap.timeline({ delay: 0.5 });
        flicker.forEach(([at, power]) => intro.set(beam, { r: () => baseR() * 0.75 * power }, at));
        intro
          .to(glyphs, { yPercent: 0, opacity: 1, scale: 1, duration: 1.6, ease: "expo.out", stagger: { each: 0.09, from: "center" } }, 1.1)
          .to(beam, { r: () => Math.max(innerWidth * 0.62, baseR() * 1.6), duration: 1.6, ease: "power2.inOut" }, 1.3)
          .addLabel("lit")
          .to(beam, { r: baseR, duration: 1.4, ease: "power3.inOut" }, "lit+=0.5")
          .fromTo(q(`.${styles.reveal}`), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.14 }, "lit+=0.9")
          .call(() => {
            aim.x = beam.x;
            aim.y = beam.y;
            mode = fine ? "pointer" : "roam";
          });

        // Once risen, the letters ripple in a slow wave; the makhana wobbles harder than the rest.
        LETTERS.forEach((l, i) => {
          const makhana = l.id === "o";
          const wave = gsap.fromTo(q(`.${styles.glyph}[data-i="${i}"] img`),
            { y: 8, rotation: makhana ? -7 : -1.2, scale: 1 },
            { y: -8, rotation: makhana ? 7 : 1.2, scale: makhana ? 1.05 : 1, duration: makhana ? 1.2 : 1.6, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true },
          );
          wave.totalTime(i * 0.26);
          intro.call(() => void wave.play(), [], 1.4);
        });

        const br = gsap.quickTo(beam, "r", { duration: 0.8, ease: "power3.out" });
        const lens = q(`.${styles.lens}`)[0];
        const lx = gsap.quickTo(lens, "x", { duration: 0.12, ease: "power3.out" });
        const ly = gsap.quickTo(lens, "y", { duration: 0.12, ease: "power3.out" });
        let held = false;

        const onMove = (e: PointerEvent) => {
          lens.classList.add(styles.seen);
          lx(e.clientX);
          ly(e.clientY);
          if (mode === "intro") return;
          // Touch steers only while a finger is down; a mouse always steers.
          if (e.pointerType !== "mouse" && !held) return;
          mode = "pointer";
          aim.x = e.clientX;
          aim.y = e.clientY;
        };
        const onDown = (e: PointerEvent) => {
          held = true;
          lens.classList.add(styles.held);
          if (mode === "intro") return;
          window.clearTimeout(idleTimer);
          mode = "pointer";
          aim.x = e.clientX;
          aim.y = e.clientY;
          br(baseR() * 1.8);
        };
        const onUp = (e: PointerEvent) => {
          held = false;
          lens.classList.remove(styles.held);
          if (mode === "intro") return;
          br(baseR());
          if (e.pointerType !== "mouse") idleTimer = window.setTimeout(() => void (mode = "roam"), 2200);
        };
        const onLeave = () => { if (mode === "pointer") mode = "roam"; };
        const onResize = () => {
          torch.resize();
          measure();
          if (mode !== "intro") br(held ? baseR() * 1.8 : baseR());
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
        document.documentElement.addEventListener("pointerleave", onLeave);
        window.addEventListener("resize", onResize);
        return () => {
          gsap.ticker.remove(tick);
          window.clearTimeout(idleTimer);
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointerup", onUp);
          window.removeEventListener("pointercancel", onUp);
          document.documentElement.removeEventListener("pointerleave", onLeave);
          window.removeEventListener("resize", onResize);
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <main ref={root} className={styles.page}>
      <h1 className={styles.sr}>Makzo&rsquo;s is coming soon</h1>

      {/* The room with the lights on. The canvas above paints the dark over it. */}
      <div className={styles.room}>
        <div className={styles.secrets} aria-hidden="true">
          {HIDDEN_STATES.map(([name, left, top, rot, size]) => (
            <span key={name} className={styles.secret} style={{ left: `${left}%`, top: `${top}%`, rotate: `${rot}deg`, fontSize: `${size}rem` }}>
              {name}
            </span>
          ))}
          {HIDDEN_PUFFS.map(([left, top, rot, size], i) => (
            <span key={i} className={styles.puff} style={{ left: `${left}%`, top: `${top}%`, rotate: `${rot}deg`, width: `${size}rem` }}>
              <Puff />
            </span>
          ))}
        </div>
        <div className={styles.word} aria-hidden="true">
          {LETTERS.map((l, i) => (
            <span key={l.id} className={styles.glyph} data-i={i} style={{ width: `${(l.width / 1200) * 100}%` }}>
              <Image src={`/brand/letter-light-${l.id}.png`} alt="" width={l.width} height={296} priority />
            </span>
          ))}
        </div>
      </div>

      <canvas className={styles.dark} aria-hidden="true" />

      <div className={styles.ui}>
        <p className={`${styles.coming} ${styles.reveal}`}>We are coming soon.</p>
        <p className={`${styles.hint} ${styles.reveal}`}>
          <span className={styles.mouseHint}>Move the torch to find where we&rsquo;re launching. Hold to turn it up.</span>
          <span className={styles.touchHint}>Drag the torch to find where we&rsquo;re launching.</span>
        </p>
        <p className={styles.sr}>Launching soon across India.</p>
      </div>

      <div className={styles.lens} aria-hidden="true"><span /></div>
    </main>
  );
}
