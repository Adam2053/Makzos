"use client";

import { useRef } from "react";
import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from "@/lib/motion";
import ui from "@/components/home/ui.module.css";
import styles from "./about.module.css";

/**
 * The name, read the way the guide reads it (D4, logo meaning). Each word is split into parts;
 * the `true` parts are the letters that make the name: MAK + Z O + ’S.
 */
const NAME: { parts: [string, boolean][]; d: string }[] = [
  { parts: [["MAK", true], ["hana", false]], d: "The hero ingredient, and the base of everything we make." },
  { parts: [["Z", true], ["er", false], ["O", true], [" guilt", false]], d: "Indulgence with nothing artificial or unnecessary." },
  { parts: [["your", false], ["’S", true]], d: "A snack people can proudly call their own." },
];
const FINAL = "MAKZO’S";

/**
 * A section breaker: "Makhana, zero guilt, your's" pops in as a sentence; then, as the page
 * scrolls (pinned), the grey letters pop away and the paprika ones fly together and land as
 * MAKZO'S. Reduced motion gets the plain three-column read.
 */
export function NameBuild() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const build = q(`.${styles.build}`)[0] as HTMLElement;
      const leads = q(`.${styles.ch}[data-lead]`) as HTMLElement[];
      const rest = q(`.${styles.ch}:not([data-lead])`) as HTMLElement[];
      const targets = q(`.${styles.targetCh}`) as HTMLElement[];
      const word = q(`.${styles.targetWord}`)[0] as HTMLElement;

      // Offsets within .build ignore transforms, so they stay true at any point of the scrub.
      const pos = (el: HTMLElement) => {
        let x = 0, y = 0, n: HTMLElement | null = el;
        while (n && n !== build) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
        return { x, y };
      };
      const size = (el: HTMLElement) => parseFloat(getComputedStyle(el).fontSize);
      const dx = (i: number) => pos(targets[i]).x - pos(leads[i]).x;
      const dy = (i: number) => pos(targets[i]).y - pos(leads[i]).y;
      const k = (i: number) => size(targets[i]) / size(leads[i]);

      // 1. The sentence pops in when it arrives.
      gsap.from(q(`.${styles.pop}`), {
        scale: 0, yPercent: 60, rotation: () => gsap.utils.random(-25, 25), duration: 0.7, ease: "back.out(2.6)",
        stagger: { each: 0.025, from: "start" },
        scrollTrigger: { trigger: build, start: "top 85%", once: true },
      });

      gsap.set(word, { autoAlpha: 0 });
      gsap.set(leads, { transformOrigin: "0 0" });

      // 2. Pinned and scrubbed: the name builds itself out of the sentence.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current, start: "top top", end: "+=170%", scrub: 0.8, pin: true,
          anticipatePin: 1, invalidateOnRefresh: true,
        },
      });
      tl.to(q(`.${styles.nameTitle}`), { autoAlpha: 0, y: -40, duration: 0.6, ease: "power2.in" }, 0.15)
        .to(q(`.${styles.desc}`), { autoAlpha: 0, y: 24, duration: 0.5, stagger: 0.08 }, 0)
        .to(q(`.${styles.rule}`), { scaleX: 0, duration: 0.6, ease: "power2.in" }, 0)
        // The leftover letters pop away, each its own way.
        .to(rest, {
          scale: 0, autoAlpha: 0, ease: "back.in(2.4)", duration: 0.6,
          y: () => gsap.utils.random(-90, -30), x: () => gsap.utils.random(-30, 30), rotation: () => gsap.utils.random(-70, 70),
          stagger: { each: 0.025, from: "random" },
        }, 0.1)
        // The name's letters puff up first...
        .to(leads, { scale: 1.18, y: -10, duration: 0.25, ease: "power2.out", stagger: 0.03 }, 0.35)
        // ...then fly into place and land with a bounce.
        .fromTo(leads, { x: 0, y: -10, scale: 1.18 }, {
          x: (i) => dx(i), y: (i) => dy(i), scale: (i) => k(i),
          duration: 1, ease: "back.out(1.5)", stagger: { each: 0.06, from: "center" },
        }, 0.7)
        // The landing: one pop of the whole word, and the reading underneath.
        .to(build, { scale: 1.06, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }, 1.95)
        .fromTo(q(`.${styles.targetLine}`), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, 2.05)
        .to({}, { duration: 0.4 });

      // This pin can be created after later ones (hot reload, remounts); put every trigger back
      // in page order so the pins below account for this one's scroll length. Then re-measure
      // once the display face has loaded.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      document.fonts?.ready.then(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <div ref={root} className={styles.nameStage}>
      <div className={ui.shell}>
        <div className={styles.build}>
          <h2 id="name-title" className={`${ui.display} ${styles.h2} ${styles.nameTitle}`}>What&rsquo;s in <span>the name.</span></h2>
          <span className={styles.rule} aria-hidden="true" />
          <ul className={styles.nameRow}>
            {NAME.map((n, i) => (
              <li key={i} className={styles.nameItem}>
                <p className={`${ui.display} ${styles.word}`} aria-label={n.parts.map((p) => p[0]).join("")}>
                  {n.parts.map(([text, lead], j) =>
                    text.split(" ").map((chunk, w) => (
                      <span key={`${j}-${w}`}>
                        {w > 0 && " "}
                        <span className={styles.wordChunk} aria-hidden="true">
                          {[...chunk].map((c, ci) => (
                            <span key={ci} className={styles.ch} data-lead={lead || undefined}>
                              <span className={styles.pop}>{c}</span>
                            </span>
                          ))}
                        </span>
                      </span>
                    )),
                  )}
                </p>
                <p className={styles.desc}>{n.d}</p>
              </li>
            ))}
          </ul>
          <div className={styles.target} aria-hidden="true">
            <p className={`${ui.display} ${styles.targetWord}`}>
              {[...FINAL].map((c, i) => <span key={i} className={styles.targetCh}>{c}</span>)}
            </p>
            <p className={`${ui.display} ${styles.targetLine}`}>Makhana. Zero guilt. Your&rsquo;s.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
