import Image from "next/image";
import Link from "next/link";
import ui from "./ui.module.css";
import styles from "./SiteFooter.module.css";

const COLUMNS = [
  { title: "Shop", links: [["Shop all", "/shop"], ["Build a box", "/#box"], ["Find your flavour", "/#map"], ["Where to buy", "/#find"]] },
  { title: "Makzo's", links: [["Our story", "/about"], ["FAQ", "/#faq"], ["Contact us", "mailto:hello@makzos.com"]] },
  { title: "Follow", links: [["Join the list", "/#community"], ["Instagram", "https://instagram.com/"]] },
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
        <p className={styles.legal}>© {new Date().getFullYear()} Solivra Innovations Private Limited</p>
      </div>
    </footer>
  );
}
