"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BOX_MAX, BOX_SIZE, SUB_OFF, boxPrice, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useStore } from "@/lib/store";
import ui from "./ui.module.css";
import styles from "./Header.module.css";

/** The header carries the purchase path and the story; help and legal live in the footer (sitemap). */
const LINKS = [
  { href: "/build-a-box", label: "Build a box" },
  { href: "/about", label: "Our story" },
  { href: "/how-we-roast", label: "How we roast" },
  { href: "/journal", label: "Journal" },
];

/** Ways to buy, beside the flavours in the Shop menu. */
const WAYS = [
  { href: "/shop", label: "All flavours", note: "The whole range, by taste" },
  { href: "/build-a-box", label: `Build a box of ${BOX_SIZE} to ${BOX_MAX}`, note: `From ${inr(boxPrice(BOX_SIZE))}, any mix` },
  { href: "/build-a-box#subscribe", label: "Subscribe and save", note: `${SUB_OFF}% off every delivery` },
  { href: "/build-a-box#gifting", label: "Gifting and hampers", note: "Ready-made boxes, with a note" },
  { href: "/store-locator", label: "Find a store", note: "Hyderabad first, then Bengaluru" },
];

/**
 * Menus close themselves when the page changes: each remembers the path it was opened on,
 * and counts as open only while that's still the page.
 */
export function Header() {
  const { count, setOpen, bagRef } = useCart();
  const { user } = useStore();
  const path = usePathname();
  const [shopAt, setShopAt] = useState<string | null>(null);
  const [sheetAt, setSheetAt] = useState<string | null>(null);
  const [sheetShop, setSheetShop] = useState(false);
  const shop = shopAt === path;
  const sheet = sheetAt === path;
  const account = user ? { href: "/account", label: `Your account, ${user.name.split(" ")[0]}` } : { href: "/login", label: "Sign in" };
  const close = () => { setShopAt(null); setSheetAt(null); };

  // The notice's height, as --notice-h, so a full-screen banner can end exactly at the screen's foot.
  const notice = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = notice.current;
    if (!el) return;
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty("--notice-h", `${el.offsetHeight}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <p ref={notice} className={styles.notice}>
        Launching first in Hyderabad, then Bengaluru. <Link href="/#community" className={ui.link}>Join the list</Link>
      </p>
      <header className={styles.header} onKeyDown={(e) => { if (e.key === "Escape") close(); }}>
        <div className={`${ui.shell} ${styles.inner}`}>
          <Link href="/" className={styles.brand} aria-label="Makzo's, home">
            <Image src="/brand/logo-dark.png" alt="" width={1200} height={296} preload className={styles.logo} />
          </Link>

          <nav aria-label="Primary" className={styles.nav}>
            {/* The Shop menu: a small card under its button, with the ways to buy. */}
            <div className={styles.shopWrap}>
              <button type="button" className={styles.navLink} aria-expanded={shop} aria-controls="shop-menu" onClick={() => setShopAt(shop ? null : path)}>
                Shop
                <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.caret}><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <div id="shop-menu" className={styles.mega} hidden={!shop}>
                <p className={styles.megaHead}>Ways to buy</p>
                <ul className={styles.ways}>
                  {WAYS.map((w) => (
                    <li key={w.href}><Link href={w.href} className={styles.way} onClick={close}><strong>{w.label}</strong><span>{w.note}</span></Link></li>
                  ))}
                </ul>
              </div>
            </div>
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={styles.navLink} aria-current={path === l.href ? "page" : undefined}>{l.label}</Link>
            ))}
          </nav>

          <Link href={account.href} className={styles.account} aria-label={account.label}>
            {user ? (
              <span className={styles.initial} aria-hidden="true">{user.name.trim().charAt(0).toUpperCase()}</span>
            ) : (
              <svg viewBox="0 0 32 32" aria-hidden="true" className={styles.bagIcon}>
                <circle cx="16" cy="11.5" r="5" />
                <path d="M6.5 27c1.2-5.2 5-8 9.5-8s8.3 2.8 9.5 8" />
              </svg>
            )}
          </Link>
          <button ref={bagRef} type="button" className={styles.bag} onClick={() => setOpen(true)}
            aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}>
            <svg viewBox="0 0 32 32" aria-hidden="true" className={styles.bagIcon}>
              <path d="M7 11h18l-1.4 15.2a2 2 0 0 1-2 1.8H10.4a2 2 0 0 1-2-1.8L7 11Z" />
              <path d="M12 14v-4a4 4 0 0 1 8 0v4" />
            </svg>
            <span className={styles.count} data-on={count > 0 || undefined}>{count}</span>
          </button>
          <button type="button" className={styles.menuBtn} aria-expanded={sheet} aria-controls="mobile-menu"
            aria-label={sheet ? "Close menu" : "Open menu"} onClick={() => setSheetAt(sheet ? null : path)}>
            <svg viewBox="0 0 32 32" aria-hidden="true" className={styles.bagIcon}>
              {sheet ? <path d="M9 9l14 14M23 9L9 23" /> : <path d="M6 11h20M6 21h20" />}
            </svg>
          </button>
        </div>

        {/* ---------- Phones: one sheet with everything ---------- */}
        <div id="mobile-menu" className={styles.sheet} hidden={!sheet}>
          <button type="button" className={styles.sheetLink} aria-expanded={sheetShop} onClick={() => setSheetShop((x) => !x)}>
            Shop <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.caret}><path d="M6 9l6 6 6-6" /></svg>
          </button>
          {sheetShop && (
            <div className={styles.sheetShop}>
              <ul className={styles.sheetWays}>
                {WAYS.map((w) => <li key={w.href}><Link href={w.href} onClick={close}>{w.label}</Link></li>)}
              </ul>
            </div>
          )}
          {LINKS.map((l) => <Link key={l.href} href={l.href} className={styles.sheetLink} onClick={close}>{l.label}</Link>)}
          <div className={styles.sheetSmall}>
            <Link href={account.href} onClick={close}>{user ? "Your account" : "Sign in"}</Link>
            <Link href="/track" onClick={close}>Track an order</Link>
            <Link href="/faq" onClick={close}>Help</Link>
            <Link href="/contact" onClick={close}>Contact</Link>
          </div>
        </div>
      </header>
      {/* Outside the header: its backdrop blur would otherwise trap a fixed layer inside it. */}
      {shop && <button type="button" className={styles.scrim} aria-label="Close menu" tabIndex={-1} onClick={close} />}
    </>
  );
}
