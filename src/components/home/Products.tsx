"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useActiveCard } from "@/lib/useActiveCard";
import { BAG_PRICE, BOX_PRICE, BOX_SIZE, FLAVOURS, byId, inr, productHref } from "@/lib/products";
import { bagKey, useCart } from "@/lib/cart";
import { Makhana } from "./Makhana";
import { INSIDE, IngredientArt } from "./Ingredients";
import { Pack } from "@/components/shop/Pack";
import { Checkpoint } from "./Checkpoint";
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
  /** The page already has a banner saying it: keep the heading for screen readers only. */
  quietHead?: boolean;
};

/**
 * Ordering the way people already order food: tap Add to cart and it's in your bag, and the
 * button becomes a stepper for that flavour's count in the bag. Buy now sits under it and goes
 * straight to checkout. The bar below shows what the bag holds and takes you to it.
 * Nothing flies or bounces; the stepper is the feedback.
 */
export function Products({ layout = "grid", ids, title, as: Heading = "h2", children, fade, quietHead }: Props) {
  const { lines, bags, count, subtotal, addBag, setQty } = useCart();
  /** "Go to bag" stops at the checkpoint first, which shows the offers, then opens the bag. */
  const [checkpoint, setCheckpoint] = useState(false);
  const router = useRouter();
  const list = useRef<HTMLUListElement>(null);
  const flavours = ids ? ids.map(byId) : FLAVOURS;
  const rail = layout === "rail";
  useActiveCard(list, rail ? "x" : "y");

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

  /*
   * Depth, the way Feastables and Bucks do it: the card turns a few degrees towards the
   * pointer, and the layers inside it sit at different depths, so the pack and whatever is
   * bursting out of it part as it turns. Written straight to the card's style: no re-render.
   */
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

  const lede = <>{inr(BAG_PRICE)} a bag. Every four you pick count as a box, {inr(BOX_PRICE)}.</>;

  /*
   * The card, Bucks-style: at rest it's only the pack, big. On hover (or keyboard focus) the
   * pack lifts out of the white card towards you, breaking past its top edge, the flavour's
   * ingredient comes out from behind it on both sides, and the name, price and the two calls
   * rise from the bottom. On a touch screen the card in front of you opens the same way. Everything stays inside the
   * card. Once it's in the bag, or on a touch screen, the bottom half simply stays up.
   */
  const cards = flavours.map((f) => {
    const n = inBag(f.id);
    const kind = INSIDE[f.id];
    return (
      <li key={f.id} className={styles.item} data-in={n > 0 || undefined} onPointerMove={tilt} onPointerLeave={untilt}>
        {/* The picture links too, but only the name is announced and tabbed to. */}
        <Link href={productHref(f.id)} className={styles.shot} tabIndex={-1} aria-hidden="true">
          <span className={styles.stagePack}>
            {/* Behind the pack, one either side: the flavour's ingredient. */}
            {kind && [0, 1].map((i) => <span key={i} className={styles.pop} data-at={i}><IngredientArt kind={kind} /></span>)}
            <Pack id={f.id} sizes="(max-width: 700px) 60vw, 240px" className={styles.pack} alt="" />
            <span className={styles.floor} />
          </span>
        </Link>
        <div className={styles.panel}>
          <div className={styles.meta}>
            <h3 className={`${ui.label} ${styles.name}`}><Link href={productHref(f.id)}>{f.name}</Link></h3>
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
    <section id="shop" className={styles.section} data-layout={layout} data-fade={fade || undefined} data-quiet={quietHead || undefined} aria-labelledby="shop-title">
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
          <header className={quietHead ? ui.sr : styles.head}>
            <Heading id="shop-title" className={`${ui.display} ${styles.title}`}>{title ?? "Meet the flavours."}</Heading>
            <p className={`${ui.lede} ${styles.lede}`}>{lede}</p>
          </header>
          {children}
          <ul ref={list} className={styles.grid}>
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
          <button type="button" className={ui.btnPaprika} onClick={() => setCheckpoint(true)}>
            Go to bag
          </button>
        </div>
      </div>
      {checkpoint && <Checkpoint onClose={() => setCheckpoint(false)} />}
    </section>
  );
}
