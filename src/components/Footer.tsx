import Image from "next/image";
import styles from "./Footer.module.css";

const COLUMNS = [
  { title: "Shop", links: ["All flavours", "The combo box", "Subscribe & save", "Gift a box"] },
  { title: "The seed", links: ["Why makhana", "How we roast", "Our farms", "Nutrition"] },
  { title: "Help", links: ["Track an order", "Shipping", "Returns", "Contact"] },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="u-shell">
        <div className={styles.top}>
          <div>
            <Image
              src="/brand/logo-light.png"
              alt="Makzo's"
              width={1200}
              height={296}
              className={styles.mark}
            />
            <p className={styles.tag}>
              Halka snack, bhari swad. Roasted makhana in four flavours —
              nothing artificial, nothing unnecessary.
            </p>
          </div>

          <div className={styles.columns}>
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className={`u-label ${styles.colTitle}`}>{col.title}</p>
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
          <p className={`u-label ${styles.fine}`}>© {new Date().getFullYear()} Makzo&apos;s Foods</p>
          <p className={`u-label ${styles.fine}`}>Made in Bihar, eaten everywhere</p>
        </div>
      </div>
    </footer>
  );
}
