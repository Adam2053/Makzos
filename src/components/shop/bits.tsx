import Link from "next/link";
import type { ReactNode } from "react";
import ui from "@/components/home/ui.module.css";
import styles from "./bits.module.css";

/** Where you are, as links back up. The last item is the page itself. */
export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.crumbs}>
        {items.map((c, i) => (
          <li key={c.label}>
            {c.href && i < items.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

const STAR = "M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6L2.5 9.5l6.6-.8L12 2.5Z";

export function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <span className={styles.stars} role="img" aria-label={`${value} out of 5`} style={{ "--s": `${size}px` } as React.CSSProperties}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden="true" data-on={i < Math.round(value) || undefined}><path d={STAR} /></svg>
      ))}
    </span>
  );
}
export { STAR };

export function SampleTag({ children = "Sample" }: { children?: ReactNode }) {
  return <span className={styles.sample}>{children}</span>;
}

export function Spinner() {
  return <span className={styles.spinner} aria-hidden="true" />;
}

/** A page's opening: optional crumbs, the title in the display face, one line under it. */
export function PageHead({ title, lede, crumbs, children }: { title: ReactNode; lede?: ReactNode; crumbs?: { href?: string; label: string }[]; children?: ReactNode }) {
  return (
    <header className={`${ui.shell} ${styles.pageHead}`}>
      {crumbs && <Crumbs items={crumbs} />}
      <h1 className={ui.display}>{title}</h1>
      {lede && <p className={ui.lede}>{lede}</p>}
      {children}
    </header>
  );
}
