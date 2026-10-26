"use client";

import Link from "next/link";
import { useRef } from "react";
import { BAG_PRICE, boxPrice, inr } from "@/lib/products";
import { BUNDLES } from "@/lib/bundles";
import { useCart } from "@/lib/cart";
import { useActiveCard } from "@/lib/useActiveCard";
import { Pack } from "@/components/shop/Pack";
import { BoxFront } from "./BoxFront";
import ui from "./ui.module.css";
import cards from "./Products.module.css";
import styles from "./Bundles.module.css";

/**
 * Ready-made boxes, laid out exactly like the range above it: the words on the left, the
 * cards running off the right, the same white card. Each card shows the Makzo's box with its
 * packs standing in it; on hover they rise out of it and fan, at different depths, and the
 * card turns towards the pointer, like the flavour cards do.
 */
export function Bundles() {
  const { addBox } = useCart();
  const list = useRef<HTMLUListElement>(null);
  useActiveCard(list, "x");

  const slide = (dir: 1 | -1) => {
    const el = list.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: smooth ? "smooth" : "auto" });
  };

  const tilt = (e: React.PointerEvent<HTMLLIElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    el.style.setProperty("--rx", `${((e.clientX - r.left) / r.width - 0.5) * 16}deg`);
    el.style.setProperty("--ry", `${((e.clientY - r.top) / r.height - 0.5) * -12}deg`);
  };
  const untilt = (e: React.PointerEvent<HTMLLIElement>) => {
    e.currentTarget.style.removeProperty("--rx");
    e.currentTarget.style.removeProperty("--ry");
  };

  return (
    <section id="bundles" className={`${cards.section} ${styles.section}`} data-layout="rail" aria-labelledby="bundles-title">
      <div className={cards.split}>
        <header className={cards.intro}>
          <h2 id="bundles-title" className={`${ui.display} ${cards.title}`}>Shop bundles.</h2>
          <p className={`${ui.lede} ${cards.lede}`}>Boxes we&rsquo;ve already worked out. The more in the box, the less each bag costs.</p>
          <div className={cards.introFoot}>
            <Link href="/build-a-box" className={ui.btnDark}>Build your own</Link>
            <div className={cards.arrows}>
              <button type="button" onClick={() => slide(-1)} aria-label="Earlier bundles">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <button type="button" onClick={() => slide(1)} aria-label="More bundles">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </header>

        <ul ref={list} className={cards.rail} tabIndex={0} aria-label="Bundles, scroll sideways for more">
          {BUNDLES.map((b) => {
            const shown = b.mystery ? [] : [...new Set(b.ids())].slice(0, 4);
            return (
              <li key={b.id} className={cards.item} onPointerMove={tilt} onPointerLeave={untilt}>
                <div className={cards.shot} aria-hidden="true">
                  <span className={`${cards.stagePack} ${styles.stage}`}>
                    {/* The packs stand in the box, behind its front wall, and rise out of it on hover. */}
                    <span className={styles.packs}>
                      {b.mystery
                        ? [0, 1, 2, 3].map((i) => <span key={i} className={styles.mystery} data-at={i} style={{ "--i": i } as React.CSSProperties}>?</span>)
                        : shown.map((id, i) => (
                          <span key={id} className={styles.slot} data-at={i} style={{ "--i": i, "--n": shown.length } as React.CSSProperties}>
                            <Pack id={id} sizes="120px" alt="" className={styles.pack} />
                          </span>
                        ))}
                    </span>
                    <BoxFront className={styles.front} label={`Box of ${b.size}`} />
                    <span className={cards.floor} />
                  </span>
                </div>
                <div className={cards.panel}>
                  <div className={cards.meta}>
                    <h3 className={`${ui.label} ${cards.name}`}>{b.name}</h3>
                    <span className={cards.price}><s className={styles.was}>{inr(b.size * BAG_PRICE)}</s>{inr(boxPrice(b.size))}</span>
                  </div>
                  <p className={styles.dek}>{b.dek}</p>
                  <div className={cards.actions}>
                    <button type="button" className={cards.addBtn} aria-label={`Add ${b.name}, ${b.size} bags, to cart`}
                      onClick={(e) => addBox(b.ids(), e.currentTarget.closest("li")?.querySelector(`.${styles.front}`) as HTMLElement | null)}>
                      Add to cart
                    </button>
                    <Link href="/build-a-box" className={cards.nowBtn}>Change the mix</Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
