"use client";

import Link from "next/link";
import { useRef } from "react";
import { BAG_PRICE, BOX_PRICE, BOX_SIZE, FLAVOURS, byId, inr, productHref } from "@/lib/products";
import { bagKey, useCart } from "@/lib/cart";
import { Makhana } from "./Makhana";
import { Pack } from "@/components/shop/Pack";
import ui from "./ui.module.css";
import styles from "./Products.module.css";

type Props = {
  /** "rail" scrolls sideways and keeps the section one row tall; "grid" stacks every flavour down the page. */
  layout?: "rail" | "grid";
  /** Which flavours to show, in order. Defaults to the whole range; pass four ids for an upsell row. */
  ids?: string[];
  title?: string;
  /** Rendered as the page's h1 on the shop page, an h2 everywhere else. */
  as?: "h1" | "h2";
  /** Anything that belongs between the heading and the products: the shop's filters. */
  children?: React.ReactNode;
};

/**
 * Ordering the way people already order food: tap Add and it's in your bag, and the
 * button becomes a stepper for that flavour's count in the bag. The bar below shows what
 * the bag holds and takes you to it. Nothing flies or bounces; the stepper is the feedback.
 */
export function Products({ layout = "grid", ids, title = "Meet the flavours.", as: Heading = "h2", children }: Props) {
  const { lines, bags, count, subtotal, addBag, setQty, setOpen } = useCart();
  const list = useRef<HTMLUListElement>(null);
  const flavours = ids ? ids.map(byId) : FLAVOURS;
  const rail = layout === "rail";

  const inBag = (id: string) => lines.find((l) => l.key === bagKey(id))?.qty ?? 0;
  const loose = bags % BOX_SIZE;
  const toBox = loose === 0 ? 0 : BOX_SIZE - loose;

  const change = (id: string, d: number) => {
    const n = inBag(id);
    if (n === 0 && d > 0) addBag(id, null, { quiet: true });
    else setQty(`bag-${id}`, n + d);
  };

  /** A nudge, not a product: first in the rail, where it's seen; last in the grid, after the range. */
  const note = (
    <li className={styles.note} data-first={rail || undefined}>
      <Makhana variant="outline" className={styles.noteSeed} />
      <p>Can&rsquo;t choose? Pick four different ones and find your favourite.</p>
      {rail
        ? <Link href="/shop" className={ui.btnPaprika}>Shop all</Link>
        : <Link href="/build-a-box" className={ui.btnPaprika}>Build a box</Link>}
    </li>
  );

  /** The arrows move the rail by most of what's on screen; scroll-snap settles it on a card. */
  const slide = (dir: 1 | -1) => {
    const el = list.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <section id="shop" className={styles.section} aria-labelledby="shop-title">
      <div className={ui.shell}>
        <header className={styles.head}>
          <Heading id="shop-title" className={`${ui.display} ${styles.title}`}>{title}</Heading>
          <div className={styles.side}>
            <p className={`${ui.lede} ${styles.lede}`}>
              {inr(BAG_PRICE)} a bag. Every four you pick count as a box, {inr(BOX_PRICE)}.
            </p>
            {rail && (
              <div className={styles.arrows}>
                <button type="button" onClick={() => slide(-1)} aria-label="Earlier flavours">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
                </button>
                <button type="button" onClick={() => slide(1)} aria-label="More flavours">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>
        </header>
        {children}
      </div>

      {/* The rail runs to the screen's edge, so the next card is always peeking in. */}
      <div className={rail ? styles.bleed : ui.shell}>
        <ul ref={list} className={rail ? styles.rail : styles.grid} tabIndex={rail ? 0 : undefined} aria-label={rail ? "Flavours, scroll sideways for more" : undefined}>
          {rail && note}
          {flavours.map((f) => {
            const n = inBag(f.id);
            return (
              <li key={f.id} className={styles.item} data-in={n > 0 || undefined}>
                {/* The picture links too, but only the name is announced and tabbed to. */}
                <Link href={productHref(f.id)} className={styles.shot} tabIndex={-1} aria-hidden="true">
                  <Pack id={f.id} sizes="(max-width: 700px) 34vw, 180px" className={styles.pack} alt="" />
                  <span className={styles.floor} />
                  {f.heat >= 2 && <span className={styles.tag}>{f.heat === 3 ? "Hot" : "Spicy"}</span>}
                  {n > 0 && <span className={styles.badge}>{n} in bag</span>}
                </Link>
                <h3 className={`${ui.display} ${styles.name}`}><Link href={productHref(f.id)}>{f.name}</Link></h3>
                <p className={styles.inspired}>{f.inspired}</p>
                <div className={styles.row}>
                  <span className={styles.price}>{inr(BAG_PRICE)}</span>
                  {n === 0 ? (
                    <button type="button" className={styles.addBtn} aria-label={`Add ${f.name} to bag`} onClick={() => change(f.id, 1)}>
                      Add <span aria-hidden="true">+</span>
                    </button>
                  ) : (
                    <span className={styles.stepper} role="group" aria-label={`${f.name} in your bag`}>
                      <button type="button" onClick={() => change(f.id, -1)} aria-label={`One fewer ${f.name}`}>−</button>
                      <output aria-live="polite">{n}</output>
                      <button type="button" onClick={() => change(f.id, 1)} aria-label={`One more ${f.name}`}>+</button>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
          {!rail && note}
        </ul>
      </div>

      <div className={ui.shell}>
        <div className={styles.bar} data-on={count > 0 || undefined} aria-live="polite">
          <div className={styles.barText}>
            <strong>{count} {count === 1 ? "item" : "items"} in your bag, {inr(subtotal)}</strong>
            <span>{toBox > 0 ? `Add ${toBox} more and ${bags > BOX_SIZE ? "the next four are" : "they're"} priced as a box.` : "Every four priced as a box."}</span>
          </div>
          <button type="button" className={ui.btnPaprika} onClick={() => setOpen(true)}>
            Go to bag
          </button>
        </div>
      </div>
    </section>
  );
}
