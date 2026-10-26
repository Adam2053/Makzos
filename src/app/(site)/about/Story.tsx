"use client";

import { useRef } from "react";
import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from "@/lib/motion";
import { Makhana } from "@/components/home/Makhana";
import { Pack } from "@/components/shop/Pack";
import { SampleTag } from "@/components/shop/bits";
import ui from "@/components/home/ui.module.css";
import styles from "./about.module.css";

/** The opening: the story in one line, the words rising in, three seeds drifting behind. */
export function StoryHero() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from(q(`.${styles.heroWord}`), { yPercent: 110, duration: 1, stagger: 0.07, ease: "power4.out", delay: 0.1 });
      gsap.from(q(`.${styles.heroFoot} > *`), { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.1, delay: 0.6, ease: "power3.out" });
      // The seeds drift at different speeds as the page scrolls away, for depth.
      q(`.${styles.heroSeed}`).forEach((el, i) => {
        gsap.to(el, { yPercent: -60 - i * 50, rotation: (i % 2 ? 1 : -1) * 40, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      });
    });
    return () => mm.revert();
  }, { scope: root });

  const line = (words: string[], accent = false) => (
    <span className={`${styles.heroLine} ${accent ? styles.accent : ""}`}>
      {words.map((w, i) => <span key={i} className={styles.heroMask}><span className={styles.heroWord}>{w}</span></span>)}
    </span>
  );

  return (
    <section ref={root} className={styles.hero} aria-labelledby="story-title">
      {[0, 1, 2].map((i) => <Makhana key={i} variant={i === 1 ? "outline" : "fill"} className={styles.heroSeed} />)}
      <div className={ui.shell}>
        <p className={`${ui.label} ${styles.eyebrow}`}>Our story</p>
        <h1 id="story-title" className={`${ui.display} ${styles.heroTitle}`}>
          {line(["We", "started"])}
          {line(["with", "the", "dish."])}
          {line(["Then", "we", "roasted", "it."], true)}
        </h1>
        <div className={styles.heroFoot}>
          <p className={`${ui.lede} ${styles.quiet}`}>
            Makzo&rsquo;s is roasted makhana, flavoured around dishes people recognise. Every pack tastes like one of them and contains nothing we wouldn&rsquo;t explain.
          </p>
          <a href="#belief" className={styles.scrollCue}>Scroll the story <span aria-hidden="true">↓</span></a>
        </div>
      </div>
    </section>
  );
}

/** The guide's purpose (D4, brand overview), set as one statement that lights up word by word as you read down. */
const BELIEF = "India has a thousand flavours, yet its snack aisle runs on a borrowed few. Makhana, one of its finest ingredients, is still sold plain or saved for fasting days. We believe it can be so much more.";

export function Belief() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.fromTo(q(`.${styles.beliefWord}`), { opacity: 0.14 }, {
        opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: q(`.${styles.beliefText}`)[0], start: "top 80%", end: "bottom 45%", scrub: true },
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} id="belief" className={styles.belief} aria-labelledby="belief-title">
      <div className={ui.shell}>
        <h2 id="belief-title" className={`${ui.label} ${styles.eyebrowLight}`}>What we believe</h2>
        <p className={`${ui.display} ${styles.beliefText}`}>
          {BELIEF.split(" ").map((w, i) => <span key={i} className={styles.beliefWord}>{w} </span>)}
        </p>
      </div>
    </section>
  );
}

/**
 * How we roast, as one sideways journey: the page pins and the six steps slide past, from the
 * pond to the pouch. Phones and reduced motion get the same steps stacked down the page.
 */
const STEPS = [
  { t: "Gathered", d: "Makhana is the seed of a water lily. It's gathered from pond beds by hand, then dried and popped.", detail: "Where ours comes from, and who grows it." },
  { t: "Graded", d: "The puffed seeds are sorted by size, so every piece in a bag roasts and seasons the same way.", detail: null },
  { t: "Roasted", d: "Dry heat, not oil. Roasted until crisp all the way through: that's where the crunch comes from.", detail: "Roast time and temperature." },
  { t: "Seasoned", d: "Each flavour is built around its dish, and tossed on in small batches so it coats every piece.", detail: null },
  { t: "Packed", d: "Into a sealed pouch, straight away, so the crunch you open is the crunch we roasted.", detail: null },
  { t: "Tested", d: "Every batch goes to an independent lab before it ships. The reports go on each flavour's page.", detail: "The lab's name and accreditation." },
];

export function Roast() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const track = q(`.${styles.track}`)[0] as HTMLElement;
    const mm = gsap.matchMedia();
    mm.add(`${MOTION_OK} and (min-width: 900px)`, () => {
      const distance = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -distance(), ease: "none",
        scrollTrigger: { trigger: q(`.${styles.pin}`)[0], start: "top top", end: () => `+=${distance()}`, scrub: 0.6, pin: true, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      // Each step's seed turns as it crosses the screen; the progress bar fills.
      q(`.${styles.stepSeed}`).forEach((el) => {
        gsap.to(el, { rotation: 200, ease: "none", scrollTrigger: { trigger: el, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
      gsap.fromTo(q(`.${styles.bar} > span`), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: q(`.${styles.pin}`)[0], start: "top top", end: () => `+=${distance()}`, scrub: true } });
      return () => ScrollTrigger.refresh();
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} id="how-we-roast" className={styles.roast} aria-labelledby="roast-title">
      <div className={styles.pin}>
        <div className={styles.track}>
          <header className={styles.roastHead}>
            <p className={`${ui.label} ${styles.eyebrow}`}>How we roast</p>
            <h2 id="roast-title" className={`${ui.display} ${styles.roastTitle}`}>From the pond <span>to the pouch.</span></h2>
            <p className={`${ui.lede} ${styles.quiet}`}>Six steps. Nothing fried, nothing added that we wouldn&rsquo;t explain.</p>
          </header>
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.t} className={styles.step}>
                <span className={`${ui.display} ${styles.num}`} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div className={styles.stepArt} aria-hidden="true">
                  {i === 4 ? <Pack id="rasam" sizes="140px" alt="" className={styles.stepPack} tilt={-8} />
                    : <Makhana variant={i % 2 ? "outline" : "fill"} className={styles.stepSeed} />}
                </div>
                <h3 className={`${ui.display} ${styles.stepTitle}`}>{s.t}</h3>
                <p>{s.d}</p>
                {s.detail && <p className={styles.todo}><SampleTag>To add</SampleTag> {s.detail}</p>}
              </li>
            ))}
          </ol>
        </div>
        <span className={styles.bar} aria-hidden="true"><span /></span>
      </div>
    </section>
  );
}
