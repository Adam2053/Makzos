import Image from "next/image";
import ui from "./ui.module.css";
import styles from "./SiteFooter.module.css";

const COLUMNS = [
  { title: "Shop", links: [["All flavours", "#shop"], ["Build a box", "#box"], ["Group orders", "#gifting"]] },
  { title: "Help", links: [["Ingredients and allergens", "#inside"], ["Launch cities", "#updates"], ["Contact us", "mailto:hello@makzos.com"]] },
  { title: "Follow", links: [["Instagram", "https://instagram.com/"]] },
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
                {c.links.map(([label, href]) => <li key={label}><a href={href} className={styles.link}>{label}</a></li>)}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className={ui.shell}>
        <Image src="/brand/logo-light.png" alt="Makzo's" width={1200} height={296} className={styles.logo} />
        <p className={styles.legal}>© {new Date().getFullYear()} Solivra Innovations Private Limited</p>
      </div>
    </footer>
  );
}
