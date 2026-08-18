import Image from "next/image";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "#flavours", label: "Flavours" },
  { href: "#specs", label: "Compare" },
  { href: "#why", label: "Why makhana" },
  { href: "#reviews", label: "Reviews" },
  { href: "#stockists", label: "Where to buy" },
];

export function Nav() {
  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <a href="#top" className={styles.brand} aria-label="Makzo's, home">
          <Image
            src="/brand/logo-dark.png"
            alt=""
            width={1200}
            height={296}
            priority
            className={styles.mark}
          />
        </a>

        <nav className={styles.links} aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={styles.link}>
              {l.label}
            </a>
          ))}
        </nav>

        <a href="#box" className={`u-label ${styles.bag}`}>
          Bag <span className={styles.count}>0</span>
        </a>
      </div>
    </header>
  );
}
