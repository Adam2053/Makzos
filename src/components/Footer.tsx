import Image from "next/image";
import styles from "./Footer.module.css";

const COLUMNS = [
  {
    title: "Shop",
    links: ["All flavours", "Build a box", "Subscribe & save", "Gift a box"],
  },
  {
    title: "The seed",
    links: ["Why makhana", "How we roast", "Our farms", "Nutrition"],
  },
  {
    title: "Help",
    links: ["Track an order", "Shipping", "Returns", "Contact"],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="u-shell">
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <Image
              src="/brand/logo-light.png"
              alt="Makzo's"
              width={1200}
              height={330}
              className={styles.mark}
            />
            <p className={`u-mono ${styles.tag}`}>
              Nothing artificial, nothing unnecessary.
            </p>
          </div>

          <div className={styles.columns}>
            {COLUMNS.map((col) => (
              <nav key={col.title} className={styles.col} aria-label={col.title}>
                <p className={`u-mono ${styles.colTitle}`}>{col.title}</p>
                <ul className={styles.colList}>
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className={styles.colLink}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={`u-mono ${styles.fine}`}>
            © {new Date().getFullYear()} Makzo&apos;s Foods
          </p>
          <p className={`u-mono ${styles.fine}`}>Made in Bihar, eaten everywhere</p>
        </div>
      </div>
    </footer>
  );
}
