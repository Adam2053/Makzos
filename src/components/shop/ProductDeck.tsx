"use client";

import Image from "next/image";
import { useRef } from "react";
import { GRAMS, byId } from "@/lib/products";
import { fmtNutrient, nutritionFor } from "@/lib/nutrition";
import { EASE, MOTION_OFF, MOTION_OK, ScrollTrigger, gsap, useGSAP } from "@/lib/motion";
import ui from "@/components/home/ui.module.css";
import { VegMark } from "./marks";
import styles from "./ProductDeck.module.css";

/**
 * The dish behind the bag, then the back of the pack, as one scrolled scene on black: the dish
 * photo sits as a wide print, pulls back, splits into three cards, the cards turn over to show
 * nutrition, ingredients and specification, and they fan into a hand, first to third, like
 * playing cards. Once fanned, hovering a card lifts it in the hand; clicking opens it: the card
 * is drawn out, straightens and comes forward while everything behind it blurs.
 *
 * Without motion (reduced motion, or before the script runs) the cards sit fanned and face up.
 */
export function ProductDeck({ id }: { id: string }) {
  const f = byId(id);
  const root = useRef<HTMLElement>(null);

  const rows = nutritionFor(id);
  const pick = (label: string) => rows.find((r) => r.label === label)!;
  const NUTRITION = [
    pick("Energy"), pick("Fat"), pick("of which saturates"), pick("Carbohydrate"),
    pick("of which sugars"), pick("Protein"), pick("Salt"),
  ];
  const anyPending = NUTRITION.some((r) => r.pending);

  const SPEC: [string, React.ReactNode][] = [
    ["Net weight", `${GRAMS} g`],
    ["Diet", <span key="veg" className={styles.veg}><VegMark size={14} /> Vegetarian</span>],
    ["Made", "Roasted, never fried"],
    ["Pack", "Centre-sealed pouch"],
    ["Origin", "India"],
    ["Lab report", "With the first batch"],
  ];

  useGSAP((_, contextSafe) => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const pinBox = q(`.${styles.pin}`)[0] as HTMLElement;
    const head = q(`.${styles.head}`)[0] as HTMLElement;
    const table = q(`.${styles.table}`)[0] as HTMLElement;
    const glow = q(`.${styles.glow}`);
    const title = q(`.${styles.title}`);
    const stage = q(`.${styles.stage}`)[0] as HTMLElement;
    const deck = q(`.${styles.deck}`)[0] as HTMLElement;
    const cards = q(`.${styles.card}`) as HTMLElement[];
    const flips = q(`.${styles.flip}`);
    const fronts = q(`.${styles.front}`);
    const photos = q(`.${styles.slice}`);
    const hint = q(`.${styles.hint}`);
    const print = q(`.${styles.print}`);

    /** Everything is sized from the card, which CSS sizes from the stage. */
    const geo = () => {
      const cw = deck.offsetWidth;
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const ch = cw * 1.4;
      const gap = Math.max(10, cw * 0.06);
      const R = cw * 0.075;
      // The row of three, scaled down where the screen is too narrow to hold it.
      const row = Math.min(1, (W * 0.92) / (3 * cw + 2 * gap));
      // The photo at first: a wide print inside the page column, with room left around it for the
      // light (on a phone, nearly the screen's width, so the zoom-out still reads).
      const startW = W < 600 ? W * 0.94 : head.offsetWidth * 0.84;
      const full = Math.max(row, Math.min(startW / (3 * cw), (H * 0.78) / ch));
      // The fan: cards turn about a point well below the hand, so their top corners open out
      // like a held hand of cards. Narrowed where the screen can't hold the full spread.
      let spread = 0.16, rot = 13;
      const reach = spread + 2.1 * Math.sin((rot * Math.PI) / 180);
      const room = ((W * 0.96) / cw - 1) / 2;
      const k = Math.min(1, Math.max(0.2, room / reach));
      spread *= k; rot *= k;
      return { cw, gap, R, row, full, spread, rot };
    };

    /** Whole, the three pieces overlap by a hair so no seam shows through the photo. */
    const seam = () => geo().cw - 1.5;

    const fan = (i: number) => {
      const g = geo(), o = i - 1;
      return { x: o * g.spread * g.cw, y: 0, rotation: o * g.rot };
    };

    const setFanned = (on: boolean) => {
      if (on) el.dataset.fanned = "";
      else { if (el.hasAttribute("data-fanned")) reset(); delete el.dataset.fanned; }
    };

    // ---------- Opening a card: drawn from the hand on click (hover only lifts it, in CSS) ----------
    const lifts = q(`.${styles.lift}`) as HTMLElement[];
    let focused = -1;
    const still = () => window.matchMedia(MOTION_OFF).matches;

    // Each card's own open/close animation, kept so it can be stopped on its own. Never
    // `killTweensOf(card)`: that would also strip the card out of the scroll timeline, and the
    // scene would then rewind without it.
    const own: (gsap.core.Animation | null)[] = cards.map(() => null);
    const stop = (i: number) => { own[i]?.kill(); own[i] = null; };
    let scene: gsap.core.Timeline | null = null;

    const putBack = contextSafe!((i: number, instant = false) => {
      const card = cards[i];
      if (focused === i) { focused = -1; delete el.dataset.focus; }
      delete card.dataset.focus;
      stop(i);
      if (instant || still()) {
        delete card.dataset.returning;
        gsap.set(card, { ...fan(i), scale: 1 });
        gsap.set(lifts[i], { clearProps: "transform" });
        return;
      }
      card.dataset.returning = "";
      own[i] = gsap.timeline({ onComplete: () => { delete card.dataset.returning; gsap.set(lifts[i], { clearProps: "transform" }); own[i] = null; } })
        .to(lifts[i], { rotationX: 0, duration: 0.3 }, 0)
        .to(card, { ...fan(i), scale: 1, duration: 0.5, ease: "power3.inOut" }, 0);
    });

    const draw = contextSafe!((i: number) => {
      if (!el.hasAttribute("data-fanned") || focused === i) return;
      if (focused >= 0) putBack(focused);
      focused = i;
      const card = cards[i];
      const { cw } = geo(), ch = cw * 1.4;
      const W = stage.clientWidth, H = stage.clientHeight;
      // As large as the stage allows (larger on a phone, where the cards are small). The card
      // scales about its low pivot, so `y` puts it back where it was, then a touch higher.
      const s = W < 600
        ? Math.max(1, Math.min(1.45, (W * 0.86) / cw, (H * 0.92) / ch))
        : Math.max(1, Math.min(1.25, (H * 0.9) / ch));
      const y = ch * (s - 1) - ch * 0.04;
      card.dataset.focus = ""; el.dataset.focus = "";
      stop(i);
      if (still()) { gsap.set(card, { x: 0, y, rotation: 0, scale: s }); return; }
      // Pulled up out of the hand, tipped back as a held card is, then brought forward and squared up.
      own[i] = gsap.timeline({ onComplete: () => { gsap.set(lifts[i], { clearProps: "transform" }); } })
        .to(card, { y: fan(i).y - ch * 0.24, duration: 0.2, ease: "power2.out" })
        .to(lifts[i], { rotationX: 14, transformPerspective: 1200, duration: 0.2, ease: "power2.out" }, 0)
        .to(card, { x: 0, y, rotation: 0, scale: s, duration: 0.6, ease: "back.out(1.5)" })
        .to(lifts[i], { rotationX: 0, duration: 0.6, ease: "back.out(2)" }, "<");
    });

    /** Scrolled back into the scene: drop any open card and hand the cards back to the timeline. */
    function reset() {
      cards.forEach((c, i) => {
        stop(i);
        delete c.dataset.focus; delete c.dataset.returning;
        gsap.set(c, { scale: 1 });
        gsap.set(lifts[i], { clearProps: "transform" });
      });
      focused = -1; delete el.dataset.focus;
      // Redraw the scene where it stands, so every card is back where the scroll says it is.
      if (scene) scene.render(scene.totalTime(), true, true);
    }

    const off: (() => void)[] = [];
    const on = <K extends keyof HTMLElementEventMap>(t: HTMLElement | Document, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
      t.addEventListener(type, fn as EventListener);
      off.push(() => t.removeEventListener(type, fn as EventListener));
    };
    cards.forEach((card, i) => {
      // A click or tap opens the card; another puts it back.
      on(card, "click", () => { if (focused === i) putBack(i); else draw(i); });
      on(card, "keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault(); card.click();
      });
    });
    // Clicking anywhere off the card, or Escape, puts it back.
    on(el, "click", (e) => { if (focused >= 0 && !(e.target as Element).closest(`.${styles.card}`)) putBack(focused); });
    on(document, "keydown", (e) => { if (e.key === "Escape" && focused >= 0) putBack(focused); });

    const mm = gsap.matchMedia();

    mm.add({ ok: MOTION_OK, off: MOTION_OFF }, (ctx) => {
      const { ok } = ctx.conditions as { ok: boolean; off: boolean };

      if (!ok) {
        gsap.set(cards, { x: (i) => fan(i).x, y: (i) => fan(i).y, rotation: (i) => fan(i).rotation });
        setFanned(true);
        return;
      }
      setFanned(false);

      // The heading stays pinned above the cards for the whole scene.
      const pinEl = pinBox;
      const headerH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;

      // The intro: the heading fades up out of a blur, then the photo after it. It plays each time
      // the section comes into view, scrolling down into it or back up into it, and resets once
      // the section is fully off screen, so it is ready to play again.
      const intro = gsap.timeline({ paused: true })
        .fromTo(title, { autoAlpha: 0, y: 32, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: EASE })
        .fromTo(table, { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, duration: 1, ease: EASE }, "-=0.35");
      intro.progress(0);
      const playIntro = () => { if (intro.progress() === 0 || intro.reversed()) intro.restart(); };
      ScrollTrigger.create({ trigger: el, start: "top 70%", end: "bottom 30%", refreshPriority: -1, onEnter: playIntro, onEnterBack: playIntro });
      ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", refreshPriority: -1, onLeave: () => intro.pause(0), onLeaveBack: () => intro.pause(0) });

      // Step 4 (the cards gathering into a hand) starts at HAND and ends, dealt, at DEALT.
      const HAND = 3.8, DEALT = HAND + 1.2;

      const tl: gsap.core.Timeline = scene = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinEl,
          pin: pinEl,
          start: () => `top ${headerH()}`,
          // A shorter run on a phone, so the scene takes less scrolling.
          end: () => `+=${window.innerHeight * (window.innerWidth < 600 ? 2.4 : 3.4)}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        // The cards answer clicks and hover from the moment the hand is dealt (step 4's end, the
        // same moment the hint appears). Read from the timeline, not the scroll position: with
        // scrub the animation trails the scrollbar, and a card opened while the scene is still
        // moving would be dragged back by it.
        onUpdate: () => setFanned(tl.time() >= DEALT),
      });

      // 1. Zoom out: the wide print pulls back, the picture inside easing out with it.
      tl.fromTo(deck, { scale: () => geo().full }, { scale: () => geo().row, duration: 1, ease: "power1.inOut" }, 0)
        .fromTo(photos, { scale: 1.2 }, { scale: 1, duration: 1, ease: "power1.inOut" }, 0)
        .fromTo(cards, { x: (i) => (i - 1) * seam(), y: 0, rotation: 0 }, { x: (i) => (i - 1) * seam(), duration: 0.001 }, 0)
        .fromTo(flips, { rotationY: 0 }, { rotationY: 0, duration: 0.001 }, 0)
        .fromTo(fronts, {
          borderRadius: (i) => {
            const R = geo().R;
            return i === 0 ? `${R}px 0px 0px ${R}px` : i === 2 ? `0px ${R}px ${R}px 0px` : "0px 0px 0px 0px";
          },
        }, { borderRadius: (i) => {
          const R = geo().R;
          return i === 0 ? `${R}px 0px 0px ${R}px` : i === 2 ? `0px ${R}px ${R}px 0px` : "0px 0px 0px 0px";
        }, duration: 0.001 }, 0)
        .fromTo(print, { autoAlpha: 1 }, { autoAlpha: 1, duration: 0.001 }, 0)
        .fromTo(fronts, { boxShadow: "0px 40px 60px -30px rgba(0,0,0,0)" }, { boxShadow: "0px 40px 60px -30px rgba(0,0,0,0)", duration: 0.001 }, 0)
        .fromTo(glow, { scale: 1, opacity: 0.9 }, { scale: 1, opacity: 0.9, duration: 1 }, 0)
        .fromTo(hint, { autoAlpha: 0 }, { autoAlpha: 0, duration: 0.001 }, 0);

      // 2. The print breaks into three: the pieces part and tilt, every corner now round.
      tl.fromTo(cards, { x: (i) => (i - 1) * seam(), rotation: 0 }, {
        x: (i) => (i - 1) * (geo().cw + geo().gap), rotation: (i) => (i - 1) * 2.5,
        duration: 0.8, ease: "power2.inOut", immediateRender: false,
      }, 1.1)
        .fromTo(fronts, {
          borderRadius: (i) => {
            const R = geo().R;
            return i === 0 ? `${R}px 0px 0px ${R}px` : i === 2 ? `0px ${R}px ${R}px 0px` : "0px 0px 0px 0px";
          },
        }, { borderRadius: () => { const R = geo().R; return `${R}px ${R}px ${R}px ${R}px`; }, duration: 0.5, immediateRender: false }, 1.1)
        // The shared shadow hands over to one under each card as they part.
        .fromTo(print, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, 1.1)
        .fromTo(fronts, { boxShadow: "0px 40px 60px -30px rgba(0,0,0,0)" }, { boxShadow: "0px 40px 60px -30px rgba(0,0,0,0.95)", duration: 0.4, immediateRender: false }, 1.1);

      // 3. Each card turns over, one after the other, and straightens as it lands.
      tl.fromTo(flips, { rotationY: 0 }, { rotationY: 180, duration: 1, stagger: 0.22, ease: "power2.inOut", immediateRender: false }, 2.1)
        .fromTo(cards, { rotation: (i) => (i - 1) * 2.5 }, { rotation: 0, duration: 1.2, ease: "power2.inOut", immediateRender: false }, 2.1);

      // 4. They gather into a hand: first, second, third, each laid over the one before.
      tl.fromTo(deck, { scale: () => geo().row }, { scale: 1, duration: 1.2, ease: "power2.inOut", immediateRender: false }, HAND)
        .fromTo(cards, { x: (i) => (i - 1) * (geo().cw + geo().gap), y: 0, rotation: 0 }, {
          x: (i) => fan(i).x, y: (i) => fan(i).y, rotation: (i) => fan(i).rotation,
          duration: 1.2, ease: "power2.inOut", immediateRender: false,
        }, HAND)
        .fromTo(glow, { scale: 1, opacity: 0.9 }, { scale: 1.08, opacity: 1, duration: 1.2, immediateRender: false }, HAND)
        .fromTo(hint, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, immediateRender: false }, DEALT)
        // A beat to rest on the fanned hand before the page moves on.
        .to({}, { duration: 0.5 });
    });

    return () => { off.forEach((f) => f()); mm.revert(); };
  }, { scope: root });

  return (
    <section ref={root} id="specs" className={styles.section} aria-labelledby="deck-title"
      style={{ "--field": f.field, "--ink": f.ink } as React.CSSProperties}>
      <div className={styles.pin}>
        {/* Paprika light, always drifting, so the cards read as lifted off the black. */}
        <div className={styles.glow} aria-hidden="true">
          <span className={styles.blob} /><span className={styles.blob} /><span className={styles.blob} /><span className={styles.blob} />
        </div>
        <header className={`${ui.shell} ${styles.head}`}>
          <h2 id="deck-title" className={`${ui.display} ${styles.title}`}>
            {f.inspired.replace("Inspired by ", "Built around ")}
          </h2>
        </header>

        <div className={styles.stage}>
          <div className={styles.table}>
            <div className={styles.deck}>
              <div className={styles.print} aria-hidden="true" />
              <ul className={styles.cards} aria-label={`What's in the ${f.name} pack`}>
                {(["Nutrition", "Ingredients", "Specification"] as const).map((title, i) => (
                  <li key={title} className={styles.card} style={{ "--i": i } as React.CSSProperties}
                    data-kind={title.toLowerCase()} tabIndex={0} aria-labelledby={`deck-${i}`}>
                    <div className={styles.lift}>
                      <div className={styles.flip}>
                        {/* Face down: one third of the dish photo. Together the three make the whole picture. */}
                        <div className={`${styles.face} ${styles.front}`} aria-hidden="true">
                          <div className={styles.slice} style={{ left: `${-100 * i}%` }}>
                            <Image src={f.dish.src} alt="" fill sizes="(max-width: 900px) 120vw, 960px"
                              style={{ objectPosition: `${f.dish.spot[0] * 100}% ${f.dish.spot[1] * 100}%` }} />
                          </div>
                        </div>

                        <div className={`${styles.face} ${styles.back}`}>
                          <h3 id={`deck-${i}`} className={`${ui.display} ${styles.cardTitle}`}>{title}</h3>

                          {i === 0 && (
                            <>
                              <p className={styles.sub}>Per {GRAMS} g pack</p>
                              <table className={styles.panel}>
                                <caption className={ui.sr}>Nutrition per {GRAMS} g pack</caption>
                                <tbody>
                                  {NUTRITION.map((r) => (
                                    <tr key={r.label} data-sub={r.sub || undefined}>
                                      <th scope="row">{r.label.replace("of which ", "")}{r.pending && <span className={styles.star} aria-label=", sample figure">*</span>}</th>
                                      <td>{fmtNutrient(r.perPack, r.unit)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {anyPending && <p className={styles.note}><span className={styles.star}>*</span> Sample until the lab report is in.</p>}
                            </>
                          )}

                          {i === 1 && (
                            <>
                              <p className={styles.lead}>Roasted makhana (fox nut) and our {f.name} seasoning.</p>
                              <div className={styles.group}>
                                <h4 className={styles.h4}>Contains</h4>
                                <ul className={styles.pills}>
                                  {["Milk", "Groundnut", "Soya"].map((a) => <li key={a}>{a}</li>)}
                                </ul>
                              </div>
                              <div className={styles.group}>
                                <h4 className={styles.h4}>Free from</h4>
                                <ul className={styles.free}>
                                  {["Preservatives", "Artificial colours", "Artificial flavours"].map((a) => <li key={a}>{a}</li>)}
                                </ul>
                              </div>
                            </>
                          )}

                          {i === 2 && (
                            <dl className={styles.spec}>
                              {SPEC.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                            </dl>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <p className={styles.hint}>Click a card to open it.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
