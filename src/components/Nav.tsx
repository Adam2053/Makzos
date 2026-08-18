import Image from "next/image";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "#shop", label: "Shop" },
  { href: "#compare", label: "Compare" },
  { href: "#why", label: "Why makhana" },
  { href: "#reviews", label: "Reviews" },
];

export function Nav() {
  return (
    <header className={styles.wrap}>
      <div className={styles.bar}>
        <a href="#top" className={styles.brand} aria-label="Makzo's, home">
          <Image src="/brand/logo-light.png" alt="" width={1200} height={296} priority className={styles.mark} />
        </a>

        <nav className={styles.links} aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={styles.link}>
              {l.label}
            </a>
          ))}
        </nav>

        <a href="#box" className={`u-pill ${styles.bag}`}>
          Bag <span className={styles.count}>0</span>
        </a>
      </div>
    </header>
  );
}
