import Image from "next/image";
import Link from "next/link";
import { FLAVOURS, productHref } from "@/lib/products";
import ui from "./ui.module.css";
import styles from "./SiteFooter.module.css";

/** The footer, as the sitemap lays it out: shop, company, help and legal. */
const COLUMNS = [
  { title: "Shop", links: [...FLAVOURS.map((f) => [f.name, productHref(f.id)]), ["Build a box", "/build-a-box"], ["Subscribe and save", "/build-a-box#subscribe"], ["Gifting and hampers", "/build-a-box#gifting"]] },
  { title: "Company", links: [["Our story", "/about"], ["How we roast", "/about#how-we-roast"], ["Journal", "/journal"], ["Reviews", "/reviews"], ["Store locator", "/store-locator"], ["Wholesale enquiry", "/contact#wholesale"], ["Careers", "/careers"], ["Creators", "/creators"]] },
  { title: "Help", links: [["Contact", "/contact"], ["FAQ", "/faq"], ["Track an order", "/track"], ["My account", "/account"], ["Shipping", "/shipping"], ["Returns and refunds", "/returns"], ["Terms", "/terms"], ["Privacy", "/privacy"]] },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${ui.shell} ${styles.top}`}>
        <p className={`${ui.display} ${styles.tag}`}>Nothing artificial.<br />Nothing unnecessary.</p>
        <div className={styles.columns}>
          {COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className={styles.colTitle}>{c.title}</h2>
              <ul>
                {c.links.map(([label, href]) => <li key={label}>
                  {href.startsWith("/") ? <Link href={href} className={styles.link}>{label}</Link> : <a href={href} className={styles.link}>{label}</a>}
                </li>)}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className={ui.shell}>
        <Image src="/brand/logo-dark.png" alt="Makzo's" width={1200} height={296} className={styles.logo} />
        <div className={styles.legal}>
          <p>© {new Date().getFullYear()} Solivra Innovations Private Limited</p>
          <p className={styles.legalLinks}><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></p>
        </div>
      </div>
    </footer>
  );
}
