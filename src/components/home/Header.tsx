"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import ui from "./ui.module.css";
import styles from "./Header.module.css";

/** Pages, not sections: the homepage scrolls on its own. */
const LINKS = [
  { href: "/shop", label: "Shop all" },
  { href: "/about", label: "Our story" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const { count, setOpen, bagRef } = useCart();
  const [menu, setMenu] = useState(false);

  return (
    <>
      <p className={styles.notice}>
        Launching first in Hyderabad, then Bengaluru. <Link href="/#community" className={ui.link}>Join the list</Link>
      </p>
      <header className={styles.header}>
        <div className={`${ui.shell} ${styles.inner}`}>
          <Link href="/" className={styles.brand} aria-label="Makzo's, home">
            <Image src="/brand/logo-dark.png" alt="" width={1200} height={296} preload className={styles.logo} />
          </Link>
          <nav id="primary-nav" aria-label="Primary" className={styles.nav} data-open={menu || undefined}>
            {LINKS.map((l) => <Link key={l.href} href={l.href} className={styles.navLink} onClick={() => setMenu(false)}>{l.label}</Link>)}
          </nav>
          <button ref={bagRef} type="button" className={styles.bag} onClick={() => setOpen(true)}
            aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}>
            <svg viewBox="0 0 32 32" aria-hidden="true" className={styles.bagIcon}>
              <path d="M7 11h18l-1.4 15.2a2 2 0 0 1-2 1.8H10.4a2 2 0 0 1-2-1.8L7 11Z" />
              <path d="M12 14v-4a4 4 0 0 1 8 0v4" />
            </svg>
            <span className={styles.count} data-on={count > 0 || undefined}>{count}</span>
          </button>
          <button type="button" className={styles.menuBtn} aria-expanded={menu} aria-controls="primary-nav"
            aria-label={menu ? "Close menu" : "Open menu"} onClick={() => setMenu((m) => !m)}>
            <svg viewBox="0 0 32 32" aria-hidden="true" className={styles.bagIcon}>
              {menu ? <path d="M9 9l14 14M23 9L9 23" /> : <path d="M6 11h20M6 21h20" />}
            </svg>
          </button>
        </div>
      </header>
    </>
  );
}
