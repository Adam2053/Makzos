"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart";
import ui from "./ui.module.css";
import styles from "./Header.module.css";

const LINKS = [
  { href: "#finder", label: "Find your flavour" },
  { href: "#flavours", label: "All flavours" },
  { href: "#offers", label: "Bundles" },
  { href: "#faq", label: "Questions" },
];

export function Header() {
  const { count, setOpen, bagRef } = useCart();

  return (
    <>
      <p className={styles.notice}>
        Launching first in Hyderabad, then Bengaluru. <a href="#updates" className={ui.link}>Get launch updates</a>
      </p>
      <header className={styles.header}>
        <div className={`${ui.shell} ${styles.inner}`}>
          <a href="#top" className={styles.brand} aria-label="Makzo's, back to top">
            <Image src="/brand/logo-paprika.png" alt="" width={1200} height={296} preload className={styles.logo} />
          </a>
          <nav aria-label="Primary" className={styles.nav}>
            {LINKS.map((l) => <a key={l.href} href={l.href} className={styles.navLink}>{l.label}</a>)}
          </nav>
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
    </>
  );
}
