"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useStore } from "@/lib/store";
import { BrandMark } from "./BrandMark";
import { LINKS, WAYS } from "./Header";
import styles from "./TabBar.module.css";

/**
 * Phones only: an app-style bar fixed to the foot of the screen, with the brand mark raised in
 * the middle as the way home. The menu rises from the bar as a sheet; like the header's menus,
 * it remembers the path it was opened on and closes itself when the page changes.
 */
export function TabBar() {
  const { count, setOpen, barBagRef } = useCart();
  const { user } = useStore();
  const path = usePathname();
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const [menuShop, setMenuShop] = useState(false);
  const menu = menuAt === path;
  const close = () => setMenuAt(null);
  const account = user ? { href: "/account", label: "Account" } : { href: "/login", label: "Sign in" };
  const shopping = path === "/shop" || path.startsWith("/products/");

  return (
    <div className={styles.root} onKeyDown={(e) => { if (e.key === "Escape") close(); }}>
      {menu && <button type="button" className={styles.scrim} aria-label="Close menu" tabIndex={-1} onClick={close} />}

      <div id="tab-menu" className={styles.sheet} hidden={!menu}>
        <button type="button" className={styles.sheetLink} aria-expanded={menuShop} onClick={() => setMenuShop((x) => !x)}>
          Shop <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.caret}><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {menuShop && (
          <ul className={styles.sheetWays}>
            {WAYS.map((w) => <li key={w.href}><Link href={w.href} onClick={close}>{w.label}</Link></li>)}
          </ul>
        )}
        {LINKS.map((l) => <Link key={l.href} href={l.href} className={styles.sheetLink} onClick={close}>{l.label}</Link>)}
        <div className={styles.sheetSmall}>
          <Link href="/track" onClick={close}>Track an order</Link>
          <Link href="/faq" onClick={close}>Help</Link>
          <Link href="/contact" onClick={close}>Contact</Link>
        </div>
      </div>

      <nav aria-label="Primary" className={styles.bar}>
        <button type="button" className={styles.tab} aria-expanded={menu} aria-controls="tab-menu" onClick={() => setMenuAt(menu ? null : path)}>
          <svg viewBox="0 0 32 32" aria-hidden="true" className={styles.icon}>
            {menu ? <path d="M9 9l14 14M23 9L9 23" /> : <path d="M6 10h20M6 16h20M6 22h20" />}
          </svg>
          {menu ? "Close" : "Menu"}
        </button>
        <Link href="/shop" className={styles.tab} aria-current={shopping ? "page" : undefined} onClick={close}>
          <svg viewBox="0 0 32 32" aria-hidden="true" className={styles.icon}>
            <path d="M5 12l2.2-6h17.6L27 12M5 12h22M5 12a3.7 3.7 0 0 0 7.3 0 3.7 3.7 0 0 0 7.4 0 3.7 3.7 0 0 0 7.3 0" />
            <path d="M7 15.5V26h18V15.5M13 26v-6h6v6" />
          </svg>
          Shop
        </Link>
        <Link href="/" className={styles.home} aria-label="Makzo's, home" aria-current={path === "/" ? "page" : undefined} onClick={close}>
          <BrandMark className={styles.mark} />
        </Link>
        <Link href={account.href} className={styles.tab} aria-current={path.startsWith("/account") || path === "/login" ? "page" : undefined} onClick={close}>
          {user ? (
            <span className={styles.initial} aria-hidden="true">{user.name.trim().charAt(0).toUpperCase()}</span>
          ) : (
            <svg viewBox="0 0 32 32" aria-hidden="true" className={styles.icon}>
              <circle cx="16" cy="11.5" r="5" />
              <path d="M6.5 27c1.2-5.2 5-8 9.5-8s8.3 2.8 9.5 8" />
            </svg>
          )}
          {account.label}
        </Link>
        <button ref={barBagRef} type="button" className={styles.tab} onClick={() => { close(); setOpen(true); }}
          aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}>
          <span className={styles.bagWrap}>
            <svg viewBox="0 0 32 32" aria-hidden="true" className={styles.icon}>
              <path d="M7 11h18l-1.4 15.2a2 2 0 0 1-2 1.8H10.4a2 2 0 0 1-2-1.8L7 11Z" />
              <path d="M12 14v-4a4 4 0 0 1 8 0v4" />
            </svg>
            <span className={styles.count} data-on={count > 0 || undefined}>{count}</span>
          </span>
          Bag
        </button>
      </nav>
    </div>
  );
}
