import Image from "next/image";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "#flavours", label: "Flavours" },
  { href: "#makhana", label: "Why makhana" },
  { href: "#sources", label: "Sources" },
];

export function Nav() {
  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <a href="#top" className={styles.brand} aria-label="Makzo's, home">
          <Image
            src="/brand/logo-light.png"
            alt=""
            width={1200}
            height={330}
            priority
            className={styles.mark}
          />
        </a>

        <nav className={styles.links} aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={`u-mono ${styles.link}`}>
              {l.label}
            </a>
          ))}
        </nav>

        <a href="#box" className={`u-mono ${styles.bag}`}>
          Bag <span className={styles.count}>0</span>
        </a>
      </div>
    </header>
  );
}
