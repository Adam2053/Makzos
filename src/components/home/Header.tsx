"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { SUB_OFF } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useStore } from "@/lib/store";
import { persisted } from "@/lib/persist";

/** The launch notice, once closed, stays closed on this browser. */
const noticeClosed = persisted("makzos-notice-closed", false);
import ui from "./ui.module.css";
import styles from "./Header.module.css";

/** The header carries the purchase path and the story; help and legal live in the footer (sitemap). Build a box is reached from the shop, not the bar. */
export const LINKS = [
  { href: "/about", label: "Our story" },
  { href: "/journal", label: "Journal" },
];

/** Ways to buy, beside the flavours in the Shop menu. */
export const WAYS = [
  { href: "/shop", label: "All flavours", note: "The whole range, by taste" },
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
  const shop = shopAt === path;
  const account = user ? { href: "/account", label: `Your account, ${user.name.split(" ")[0]}` } : { href: "/login", label: "Sign in" };
  const close = () => setShopAt(null);

  // The notice's height, as --notice-h, so a full-screen banner can end exactly at the screen's foot.
  const notice = useRef<HTMLDivElement>(null);
  const closed = useSyncExternalStore(noticeClosed.subscribe, noticeClosed.get, noticeClosed.getServer);
  useEffect(() => {
    const el = notice.current;
    const root = document.documentElement.style;
    if (!el) { root.setProperty("--notice-h", "0px"); return; }
    const ro = new ResizeObserver(() => root.setProperty("--notice-h", `${el.offsetHeight}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, [closed]);

  /*
   * Over the homepage film the header goes clear: no fill, white logo and links, so the film
   * runs up under it. Once the film has scrolled up behind the header it turns solid again.
   */
  const [heroAt, setHeroAt] = useState<{ path: string; over: boolean } | null>(null);
  // Until the first check, assume the homepage film is behind the header, so the server render
  // is already clear and a reload doesn't flash a white bar before it turns clear.
  const overHero = heroAt?.path === path ? heroAt.over : path === "/";
  useEffect(() => {
    const check = () => {
      const hero = document.querySelector("[data-hero]");
      // Clear only while a good stretch of film is still behind the header, not its last sliver.
      setHeroAt({ path, over: !!hero && hero.getBoundingClientRect().bottom > 160 });
    };
    const frame = requestAnimationFrame(check);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", check); window.removeEventListener("resize", check); };
  }, [path]);
  // The Shop menu is its own white card, so the bar stays clear behind it.
  const clear = overHero;

  return (
    <>
      {!closed && (
        <div ref={notice} className={styles.notice}>
          <p>Launching first in Hyderabad, then Bengaluru. <Link href="/#community" className={ui.link}>Join the list</Link></p>
          <button type="button" className={styles.noticeClose} onClick={() => noticeClosed.set(true)} aria-label="Close this notice">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" /></svg>
          </button>
        </div>
      )}
      <header className={styles.header} data-clear={clear || undefined} onKeyDown={(e) => { if (e.key === "Escape") close(); }}>
        <div className={`${ui.shell} ${styles.inner}`}>
          <Link href="/" className={styles.brand} aria-label="Makzo's, home">
            <Image src="/brand/logo-dark.png" alt="" width={1200} height={296} preload className={`${styles.logo} ${styles.logoDark}`} />
            <Image src="/brand/logo-light.png" alt="" width={1200} height={296} preload className={`${styles.logo} ${styles.logoLight}`} />
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
        </div>

      </header>
      {/* Outside the header: its backdrop blur would otherwise trap a fixed layer inside it. */}
      {shop && <button type="button" className={styles.scrim} aria-label="Close menu" tabIndex={-1} onClick={close} />}
    </>
  );
}
