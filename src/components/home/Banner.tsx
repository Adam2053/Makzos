"use client";

import { useEffect, useRef } from "react";
import { HERO_CLIP } from "@/lib/ugc";
import { MOTION_OK, gsap, useGSAP } from "@/lib/motion";
import { BrandMark } from "./BrandMark";
import ui from "./ui.module.css";
import styles from "./Banner.module.css";

/** Each line split into letters, so they can rise one after another. Screen readers get the line whole. */
const Letters = ({ text }: { text: string }) => (
  <>
    <span className={ui.sr}>{text}</span>
    <span aria-hidden="true">
      {text.split(" ").map((word, w) => (
        <span key={w} className={styles.word}>
          {[...word].map((ch, i) => <span key={i} className={styles.char}>{ch}</span>)}
        </span>
      ))}
    </span>
  </>
);

/**
 * The hero: a banner film across the whole first screen, running up under the clear header,
 * one line and one call. The film autoplays, muted and looping, with no controls: it's the
 * backdrop, not something to watch. It is a MOCK (see HERO_CLIP) until the final banner is
 * designed. The headline builds letter by letter, the second line lands with a crunch, and
 * the brand symbol (D4) bounces in on its full stop and keeps a slow wobble.
 */
export function Banner() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  // Some browsers ignore the autoplay attribute until the page is interacted with; ask again once mounted.
  useEffect(() => { video.current?.play().catch(() => {}); }, []);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const first = q(`.${styles.line}:first-child .${styles.char}`);
      const second = q(`.${styles.accent} .${styles.char}`);
      gsap.timeline({ defaults: { ease: "power4.out" } })
        .from(first, { yPercent: 110, rotation: 8, duration: 0.8, stagger: 0.035 }, 0.15)
        .from(second, { yPercent: 110, rotation: -8, duration: 0.8, stagger: 0.035 }, 0.45)
        // The crunch: the second line squashes as it lands, then springs back.
        .to(q(`.${styles.accent} .${styles.lineInner}`), { scaleY: 0.88, scaleX: 1.04, duration: 0.12, ease: "power2.in", transformOrigin: "50% 100%" }, 1.05)
        .to(q(`.${styles.accent} .${styles.lineInner}`), { scaleY: 1, scaleX: 1, duration: 0.7, ease: "elastic.out(1, 0.35)" })
        .from(q(`.${styles.seed}`), { scale: 0, rotation: -120, y: -60, duration: 0.9, ease: "back.out(2.2)" }, 1.05)
        .from(q(`.${styles.foot} > *`), { autoAlpha: 0, y: 16, duration: 0.7, stagger: 0.1, ease: "power3.out" }, 1.1);
      // The symbol keeps a slow, happy wobble; the film drifts in very slowly.
      gsap.to(q(`.${styles.seed}`), { rotation: 24, y: -6, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2 });
      gsap.fromTo(video.current, { scale: 1.08 }, { scale: 1, duration: 8, ease: "power2.out" });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} className={styles.banner} aria-labelledby="banner-title" data-hero>
      <video ref={video} className={styles.video} src={HERO_CLIP.src} poster={HERO_CLIP.poster}
        autoPlay muted loop playsInline preload="auto" disablePictureInPicture aria-hidden="true" tabIndex={-1} />
      <div className={styles.shade} aria-hidden="true" />

      <div className={`${ui.shell} ${styles.inner}`}>
        <h1 id="banner-title" className={`${ui.display} ${styles.title}`}>
          <span className={styles.line}><span className={styles.lineInner}><Letters text="Real dishes." /></span></span>
          <span className={`${styles.line} ${styles.accent}`}>
            <span className={styles.lineInner}><Letters text="New crunch." /><BrandMark className={styles.seed} /></span>
          </span>
        </h1>
        <div className={styles.foot}>
          <p className={styles.sub}>Roasted makhana in flavours you already know. Nothing artificial. Nothing unnecessary.</p>
          <a href="#shop" className={`${ui.btnPaprika} ${styles.cta}`}>Explore flavours</a>
        </div>
      </div>

      {HERO_CLIP.sample && <span className={styles.tag}>Sample video</span>}
    </section>
  );
}
