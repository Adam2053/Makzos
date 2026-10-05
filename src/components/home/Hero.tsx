"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BAG_PRICE, FEATURED, PACK_H, PACK_W, WEIGHT, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { EASE, MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { Makhana, type MakhanaVariant } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Hero.module.css";

/** The wordmark as single glyphs, the same cut the launch page uses; widths are shares of the 1200px logo. */
const LETTERS = [
  { id: "m", width: 225 },
  { id: "a", width: 170 },
  { id: "k", width: 173 },
  { id: "z", width: 174 },
  { id: "o", width: 246 },
  { id: "s", width: 212 },
];
const LEFT_W = LETTERS.slice(0, 4).reduce((sum, l) => sum + l.width, 0);
/** The makhana sits at 72.08% of the wordmark; this shifts it to the centre while the rest hides behind it. */
const MARK_CENTRE = -22.08;

/**
 * Loose makhanas around the stage. On paprika the outline variant would vanish, so the
 * field alternates paprika-filled and plain inked ones. `depth` sets how far each one
 * drifts against the pointer.
 */
const LOOSE: { x: string; y: string; size: string; rot: number; depth: number; variant: MakhanaVariant }[] = [
  { x: "2%", y: "4%", size: "clamp(56px, 7vw, 104px)", rot: -18, depth: 0.6, variant: "fill" },
  { x: "80%", y: "-4%", size: "clamp(44px, 5vw, 72px)", rot: 22, depth: 1, variant: "ink" },
  { x: "86%", y: "64%", size: "clamp(64px, 8vw, 120px)", rot: -8, depth: 0.4, variant: "fill" },
  { x: "-6%", y: "74%", size: "clamp(40px, 4.4vw, 64px)", rot: 30, depth: 1.2, variant: "ink" },
];

function glyph(l: (typeof LETTERS)[number], i: number) {
  const share = i === 5 ? 100 : (l.width / (i < 4 ? LEFT_W : 1200)) * 100;
  return (
    <span key={l.id} className={`${styles.glyph} ${i === 4 ? styles.mark : ""}`} style={{ width: `${share}%` }}>
      <Image src={`/brand/letter-${l.id}.png`} alt="" width={l.width} height={296} loading="eager" draggable={false} />
    </span>
  );
}

export function Hero() {
  const [index, setIndex] = useState(0);
  const active = FEATURED[index];
  const { addBag } = useCart();

  const root = useRef<HTMLElement>(null);
  const packRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dishRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shown = useRef(0);
  const picker = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  /** Read once: StrictMode runs effects twice, and the first cleanup clears the flag. */
  const introMode = useRef<string | null>(null);

  /** Puts the white pill under the chosen flavour, wherever the options have wrapped to. */
  const placePill = (i: number, animate: boolean) => {
    const btn = picker.current?.querySelectorAll("button")[i];
    if (!btn || !pill.current) return;
    picker.current!.dataset.ready = "";
    const to = { x: btn.offsetLeft, y: btn.offsetTop, width: btn.offsetWidth, height: btn.offsetHeight };
    if (animate && window.matchMedia(MOTION_OK).matches) gsap.to(pill.current, { ...to, duration: 0.55, ease: "elastic.out(1, 0.75)" });
    else gsap.set(pill.current, to);
  };

  // The pill follows the layout when the options re-wrap.
  useGSAP(() => {
    placePill(0, false);
    const ro = new ResizeObserver(() => placePill(shown.current, false));
    ro.observe(picker.current!);
    return () => ro.disconnect();
  }, { scope: root });

  /* Load: the launch page's logo intro, then the name flies up into the header and the page pops in. */
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const html = document.documentElement;
        introMode.current ??= html.dataset.intro ?? "none";
        const full = introMode.current === "full";
        if (introMode.current !== "none") html.dataset.intro = introMode.current;

        const navLogo = document.getElementById("nav-logo");
        const fly = q(`.${styles.fly}`)[0];
        const word = q(`.${styles.word}`)[0];
        const mark = q(`.${styles.mark}`)[0];
        const tl = gsap.timeline({ defaults: { ease: EASE } });

        if (full) {
          gsap.set(word, { xPercent: MARK_CENTRE });
          gsap.set(q(`.${styles.left} .${styles.slide}`), { xPercent: 100 });
          gsap.set(q(`.${styles.right} .${styles.slide}`), { xPercent: -100 });
          // Hidden until they move, so no sliver of a letter peeks past the clip edge.
          gsap.set(q(`.${styles.slide}`), { autoAlpha: 0 });
          tl.from(mark, { scale: 0, rotation: -24, duration: 0.85, ease: "back.out(2.2)", transformOrigin: "50% 60%" }, 0.2)
            .addLabel("open", "+=0.1")
            .set(q(`.${styles.slide}`), { autoAlpha: 1 }, "open")
            .to(word, { xPercent: 0, duration: 1, ease: "expo.inOut" }, "open")
            .to(q(`.${styles.slide}`), { xPercent: 0, duration: 1, ease: "expo.inOut" }, "open")
            .to(q(`.${styles.mark} img`), { y: -8, rotation: 7, scale: 1.05, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: 1 }, ">-0.1")
            .addLabel("fly", "+=0.05")
            // Measured at take-off, so it lands true even if the visitor scrolled during the intro.
            .to(fly, {
              x: () => navLogo!.getBoundingClientRect().left - fly.getBoundingClientRect().left,
              y: () => navLogo!.getBoundingClientRect().top - fly.getBoundingClientRect().top,
              scale: () => navLogo!.getBoundingClientRect().width / word.getBoundingClientRect().width,
              duration: 0.85, ease: "expo.inOut",
            }, "fly")
            .set(navLogo, { opacity: 1 })
            .set(q(`.${styles.intro}`), { autoAlpha: 0 })
            .addLabel("deal", "fly+=0.4");
        } else {
          tl.addLabel("deal", 0.05);
        }

        // y is pinned to 0: GSAP would otherwise keep the CSS start offset as pixels on top of yPercent.
        tl.fromTo(q(`.${styles.line} > span`), { yPercent: 105, y: 0 }, { yPercent: 0, y: 0, duration: 0.9, stagger: 0.1, ease: "expo.out" }, "deal")
          .fromTo(q(`.${styles.sub}, .${styles.picker}, .${styles.ctas}`), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, "deal+=0.25")
          // The plate puffs up the way the seed does, then the pack lands on it.
          .fromTo(q(`.${styles.plate}`), { scale: 0.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.1, ease: "elastic.out(1, 0.7)" }, "deal+=0.1")
          .fromTo(q(`.${styles.packs}`), { yPercent: -50, autoAlpha: 0, rotation: -20 }, { yPercent: 0, autoAlpha: 1, rotation: 0, duration: 1, ease: "back.out(1.5)" }, "deal+=0.4")
          .fromTo(q(`.${styles.loose}`), { scale: 0 }, { scale: 1, duration: 0.8, stagger: 0.08, ease: "back.out(2.4)" }, "deal+=0.55")
          .call(() => {
            delete html.dataset.intro;
            try { sessionStorage.setItem("mz-intro", "1"); } catch {}
          });

        // Anyone in a hurry can click or press a key to skip straight to the page.
        const skip = () => { if (tl.progress() < 1) tl.progress(1); };
        if (full) {
          window.addEventListener("pointerdown", skip, { once: true });
          window.addEventListener("keydown", skip, { once: true });
        }

        const after = tl.duration();
        // Barely moving: the pack should look suspended, not animated.
        gsap.to(q(`.${styles.packs}`), { y: -10, rotation: 1.2, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: after });
        // The loose makhanas bob on their own clocks, so they never move in step.
        q(`.${styles.looseInner}`).forEach((el, i) => {
          gsap.to(el, { y: i % 2 ? 10 : -12, rotation: i % 2 ? -10 : 10, duration: 2.2 + i * 0.45, ease: "sine.inOut", yoyo: true, repeat: -1, delay: after });
        });

        // And drift against the pointer, nearer ones further.
        const drift = q(`.${styles.loose}`).map((el, i) => ({
          x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
          d: LOOSE[i].depth,
        }));
        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          const dx = e.clientX / innerWidth - 0.5, dy = e.clientY / innerHeight - 0.5;
          for (const m of drift) { m.x(dx * -40 * m.d); m.y(dy * -30 * m.d); }
        };
        const el = root.current!;
        el.addEventListener("pointermove", onMove);

        return () => {
          window.removeEventListener("pointerdown", skip);
          window.removeEventListener("keydown", skip);
          el.removeEventListener("pointermove", onMove);
          delete html.dataset.intro;
          if (navLogo) navLogo.style.opacity = "";
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  /* Flavour change: the old pack drops off, the new one lands, and the plate opens from its centre. */
  useGSAP(
    () => {
      const from = shown.current;
      if (from === index) return;
      shown.current = index;
      const out = packRefs.current[from], into = packRefs.current[index];
      const dishOut = dishRefs.current[from], dishIn = dishRefs.current[index];

      if (!window.matchMedia(MOTION_OK).matches) {
        gsap.set([out, dishOut], { autoAlpha: 0 });
        gsap.set([into, dishIn], { autoAlpha: 1 });
        return;
      }
      gsap.to(out, { yPercent: 40, rotation: 10, autoAlpha: 0, duration: 0.45, ease: "power2.in" });
      gsap.fromTo(into, { yPercent: -45, rotation: -12, autoAlpha: 0 }, { yPercent: 0, rotation: 0, autoAlpha: 1, duration: 0.9, delay: 0.25, ease: "back.out(1.6)" });
      gsap.set(dishIn, { autoAlpha: 1, zIndex: 2 });
      gsap.set(dishOut, { zIndex: 1 });
      gsap.fromTo(dishIn, { clipPath: "circle(0% at 50% 50%)" }, {
        clipPath: "circle(75% at 50% 50%)", duration: 0.9, ease: "expo.inOut",
        onComplete: () => void gsap.set(dishOut, { autoAlpha: 0 }),
      });
    },
    { scope: root, dependencies: [index] },
  );

  const pick = (i: number) => {
    placePill(i, true);
    setIndex(i);
    // The little pack in the option hops when it's chosen.
    const mini = picker.current?.querySelectorAll(`.${styles.optPack}`)[i];
    if (mini && window.matchMedia(MOTION_OK).matches) gsap.fromTo(mini, { y: 0, rotation: -8 }, { y: -10, rotation: 6, duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out" });
  };

  return (
    <section id="top" ref={root} className={styles.hero}>
      <div className={styles.intro} aria-hidden="true">
        <div className={styles.fly}>
          <div className={styles.word}>
            <span className={styles.left}><span className={styles.slide}>{LETTERS.slice(0, 4).map(glyph)}</span></span>
            {glyph(LETTERS[4], 4)}
            <span className={styles.right}><span className={styles.slide}>{glyph(LETTERS[5], 5)}</span></span>
          </div>
        </div>
      </div>

      <div className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.copy}>
          <h1 className={`${ui.display} ${styles.title}`}>
            <span className={styles.line}><span>Real dishes.</span></span>
            <span className={styles.line}><span>New crunch.</span></span>
          </h1>
          <p className={`${ui.lede} ${styles.sub}`}>
            Roasted makhana in flavours built around dishes you already know.
          </p>

          {/* A segmented control: each option is the actual pack plus its name, and a white pill slides to the one you pick. */}
          <div ref={picker} className={styles.picker} role="group" aria-label="Choose a flavour">
            <span ref={pill} className={styles.pill} aria-hidden="true" />
            {FEATURED.map((f, i) => (
              <button key={f.id} type="button" className={styles.option} aria-pressed={i === index} onClick={() => pick(i)}>
                <span className={styles.optPack}><Image src={f.pack} alt="" width={PACK_W} height={PACK_H} sizes="40px" /></span>
                <span className={styles.optName}>{f.name}</span>
              </button>
            ))}
          </div>

          <div className={styles.ctas}>
            <button type="button" className={ui.btn} onClick={() => addBag(active.id, packRefs.current[index]?.querySelector("img"))}>
              Add {active.name}, {inr(BAG_PRICE)}
            </button>
            <a href="#flavours" className={ui.link}>See all seven flavours</a>
          </div>
        </div>

        <div className={styles.stage}>
          {LOOSE.map((m, i) => (
            <span key={i} className={styles.loose} style={{ left: m.x, top: m.y, width: m.size, rotate: `${m.rot}deg` }}>
              <span className={styles.looseInner}><Makhana variant={m.variant} /></span>
            </span>
          ))}

          <div className={styles.plate}>
            {FEATURED.map((f, i) => (
              <div key={f.id} ref={(el) => { dishRefs.current[i] = el; }} className={styles.dish}>
                <Image src={f.dish.src} alt={`The dish behind ${f.name}`} fill sizes="(max-width: 900px) 80vw, 40vw" loading={i === 0 ? "eager" : "lazy"}
                  style={{ objectPosition: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%`, transformOrigin: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%` }} />
              </div>
            ))}
          </div>

          <div className={styles.packs}>
            {FEATURED.map((f, i) => (
              <div key={f.id} ref={(el) => { packRefs.current[i] = el; }} className={styles.pack}>
                <Image src={f.pack} alt={`Makzo's ${f.name} roasted makhana, ${WEIGHT} pack`} width={PACK_W} height={PACK_H}
                  sizes="(max-width: 900px) 46vw, 22vw" loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
