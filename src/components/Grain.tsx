import styles from "./Grain.module.css";

/** Fixed film grain over the whole page — the darkroom, not a dark theme. */
export function Grain() {
  return <div className={styles.grain} aria-hidden="true" />;
}
