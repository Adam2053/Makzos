"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { BAG_PRICE, BOX_PRICE, BOX_SIZE, FLAVOURS, byId, inr, productHref } from "@/lib/products";
import { bagKey, useCart } from "@/lib/cart";
import { Makhana } from "./Makhana";
import { INSIDE, IngredientArt } from "./Ingredients";
import { Pack } from "@/components/shop/Pack";
import ui from "./ui.module.css";
import styles from "./Products.module.css";

type Props = {
  /** "rail" scrolls sideways and keeps the section one row tall; "grid" stacks every flavour down the page. */
  layout?: "rail" | "grid";
  /** Which flavours to show, in order. Defaults to the whole range; pass four ids for an upsell row. */
  ids?: string[];
  /** The heading. Left out, the grid says "Meet the flavours." and the rail leads with the can't-choose nudge instead. */
  title?: string;
  /** Rendered as the page's h1 on the shop page, an h2 everywhere else. */
  as?: "h1" | "h2";
  /** Anything that belongs between the heading and the products: the shop's filters. */
  children?: React.ReactNode;
  /** Fade the grey section out into the white one below it, instead of ending on a hard edge. */
  fade?: boolean;
};

/**
 * Ordering the way people already order food: tap Add to cart and it's in your bag, and the
 * button becomes a stepper for that flavour's count in the bag. Buy now sits under it and goes
 * straight to checkout. The bar below shows what the bag holds and takes you to it.
 * Nothing flies or bounces; the stepper is the feedback.
 */
export function Products({ layout = "grid", ids, title, as: Heading = "h2", children, fade }: Props) {
  const { lines, bags, count, subtotal, addBag, setQty, setOpen } = useCart();
  const router = useRouter();
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

  /** Already in the bag: checkout as it is. Otherwise one bag goes in first. */
  const buyNow = (id: string) => {
    if (inBag(id) === 0) addBag(id, null, { quiet: true });
    router.push("/checkout");
  };

  /** A nudge, not a product: last in the grid, after the range. The rail's intro column does this job there. */
  const note = (
    <li className={styles.note}>
      <Makhana variant="outline" className={styles.noteSeed} />
      <p>Can&rsquo;t choose? Pick four different ones and find your favourite.</p>
      <Link href="/build-a-box" className={ui.btnPaprika}>Build a box</Link>
    </li>
  );

  /** The arrows move the rail by most of what's on screen; scroll-snap settles it on a card. */
  const slide = (dir: 1 | -1) => {
    const el = list.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: smooth ? "smooth" : "auto" });
  };

  const lede = <>{inr(BAG_PRICE)} a bag. Every four you pick count as a box, {inr(BOX_PRICE)}.</>;

  /*
   * The card, Bucks-style: at rest it's only the pack, big. On hover (or keyboard focus) the
   * pack steps back a little, two pieces of the flavour's ingredient slide out from behind it,
   * and the name, price and the two calls rise from the bottom. Everything stays inside the
   * card. Once it's in the bag, or on a touch screen, the bottom half simply stays up.
   */
  const cards = flavours.map((f) => {
    const n = inBag(f.id);
    const kind = INSIDE[f.id];
    return (
      <li key={f.id} className={styles.item} data-in={n > 0 || undefined}>
        {/* The picture links too, but only the name is announced and tabbed to. */}
        <Link href={productHref(f.id)} className={styles.shot} tabIndex={-1} aria-hidden="true">
          <span className={styles.stagePack}>
            {kind && [0, 1].map((i) => <span key={i} className={styles.pop} data-at={i}><IngredientArt kind={kind} /></span>)}
            <Pack id={f.id} sizes="(max-width: 700px) 60vw, 240px" className={styles.pack} alt="" />
            <span className={styles.floor} />
          </span>
        </Link>
        <div className={styles.panel}>
          <div className={styles.meta}>
            <h3 className={`${ui.display} ${styles.name}`}><Link href={productHref(f.id)}>{f.name}</Link></h3>
            <span className={styles.price}>{inr(BAG_PRICE)}</span>
          </div>
          {/* Two calls, one above the other: keep shopping, or go now. */}
          <div className={styles.actions}>
            {n === 0 ? (
              <button type="button" className={styles.addBtn} aria-label={`Add ${f.name} to cart`} onClick={() => change(f.id, 1)}>
                Add to cart
              </button>
            ) : (
              <span className={styles.stepper} role="group" aria-label={`${f.name} in your bag`}>
                <button type="button" onClick={() => change(f.id, -1)} aria-label={`One fewer ${f.name}`}>−</button>
                <output aria-live="polite">{n} in bag</output>
                <button type="button" onClick={() => change(f.id, 1)} aria-label={`One more ${f.name}`}>+</button>
              </span>
            )}
            <button type="button" className={styles.nowBtn} aria-label={`Buy ${f.name} now`} onClick={() => buyNow(f.id)}>
              Buy now
            </button>
          </div>
        </div>
      </li>
    );
  });

  return (
    <section id="shop" className={styles.section} data-layout={layout} data-fade={fade || undefined} aria-labelledby="shop-title">
      {rail ? (
        /*
         * The rail: words on the left, cards running off the right of the screen.
         * On a phone the words sit on top as a heading and the cards scroll underneath.
         */
        <div className={styles.split}>
          <header className={styles.intro}>
            {title ? (
              <>
                <Heading id="shop-title" className={`${ui.display} ${styles.title}`}>{title}</Heading>
                <p className={`${ui.lede} ${styles.lede}`}>{lede}</p>
              </>
            ) : (
              /* No heading given: the seed and the nudge lead the section, as its heading. */
              <>
                <Makhana variant="outline" className={styles.noteSeed} />
                <Heading id="shop-title" className={styles.nudge}>Can&rsquo;t choose? Pick four different ones and find your favourite.</Heading>
              </>
            )}
            {children}
            <div className={styles.introFoot}>
              <Link href="/shop" className={ui.btnDark}>Shop all</Link>
              <div className={styles.arrows}>
                <button type="button" onClick={() => slide(-1)} aria-label="Earlier flavours">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
                </button>
                <button type="button" onClick={() => slide(1)} aria-label="More flavours">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </header>
          <ul ref={list} className={styles.rail} tabIndex={0} aria-label="Flavours, scroll sideways for more">
            {cards}
          </ul>
        </div>
      ) : (
        <div className={ui.shell}>
          <header className={styles.head}>
            <Heading id="shop-title" className={`${ui.display} ${styles.title}`}>{title ?? "Meet the flavours."}</Heading>
            <p className={`${ui.lede} ${styles.lede}`}>{lede}</p>
          </header>
          {children}
          <ul className={styles.grid}>
            {cards}
            {note}
          </ul>
        </div>
      )}

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
