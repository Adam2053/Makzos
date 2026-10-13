import Link from "next/link";
import { Header } from "@/components/home/Header";
import { SiteFooter } from "@/components/home/SiteFooter";
import { CartDrawer } from "@/components/home/CartDrawer";
import { Makhana } from "@/components/home/Makhana";
import ui from "@/components/home/ui.module.css";
import styles from "./not-found.module.css";

/** A page that isn't there, said plainly, with the ways back. */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={`${ui.shell} ${styles.inner}`}>
          <Makhana variant="fill" className={styles.seed} />
          <h1 className={`${ui.display} ${styles.title}`}>This page has been eaten.</h1>
          <p className={ui.lede}>The link may be old, or mistyped. The flavours are all still here.</p>
          <div className={styles.actions}>
            <Link href="/shop" className={ui.btnPaprika}>Shop the flavours</Link>
            <Link href="/" className={ui.btnLine}>Go home</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
      <CartDrawer />
    </>
  );
}
