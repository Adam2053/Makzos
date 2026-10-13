import Image from "next/image";
import Link from "next/link";
import ui from "@/components/home/ui.module.css";
import styles from "./checkout-frame.module.css";

/** Checkout keeps the logo and a way back, and drops everything else that could pull you away. */
export default function CheckoutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className={styles.header}>
        <div className={`${ui.shell} ${styles.inner}`}>
          <Link href="/" className={styles.brand} aria-label="Makzo's, home">
            <Image src="/brand/logo-dark.png" alt="" width={1200} height={296} preload className={styles.logo} />
          </Link>
          <span className={styles.secure}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>
            Secure checkout
          </span>
          <Link href="/cart" className={`${ui.link} ${styles.back}`}>Back to bag</Link>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={`${ui.shell} ${styles.footer}`}>
        <Link href="/shipping">Delivery</Link>
        <Link href="/returns">Returns</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href="mailto:hello@makzos.com">hello@makzos.com</a>
      </footer>
    </>
  );
}
