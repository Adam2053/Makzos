import { useId } from "react";
import styles from "./BoxFront.module.css";

/**
 * The front of the Makzo's box, printed the way the packs are (guide D4, packaging and
 * patterns): a Paprika field, the brand's checkerboard along the top edge, the wordmark in
 * white, ROASTED MAKHANA spaced out under it, and the tagline on a slanted black ribbon.
 *
 * Drawn as inline SVG, which scales with the face by itself. No container queries: Safari
 * drops elements that are size containers inside a 3D-transformed parent, and this face
 * always sits in one (a bundle card's stage, a wall of the 3D box).
 */
export function BoxFront({ className, label, children }: { className?: string; label?: string; children?: React.ReactNode }) {
  // Each face gets its own pattern id: several boxes can be on one page, and some are hidden.
  const checks = `checks-${useId().replace(/:/g, "")}`;
  return (
    <span className={`${styles.face} ${className ?? ""}`} aria-hidden="true">
      <svg className={styles.checks} viewBox="0 0 80 2" preserveAspectRatio="xMinYMin slice">
        <defs>
          <pattern id={checks} width="2" height="2" patternUnits="userSpaceOnUse">
            <rect width="2" height="2" fill="#fff" /><rect width="1" height="1" fill="#181818" /><rect x="1" y="1" width="1" height="1" fill="#181818" />
          </pattern>
        </defs>
        <rect width="80" height="2" fill={`url(#${checks})`} />
      </svg>
      <svg className={styles.brand} viewBox="0 0 100 38" preserveAspectRatio="xMidYMid meet">
        <image href="/brand/logo-light.png" x="11" y="2" width="78" height="19.25" />
        <text x="50" y="33" textAnchor="middle" className={styles.roasted}>ROASTED MAKHANA</text>
      </svg>
      <span className={styles.ribbon}>
        <svg viewBox="0 0 100 6" preserveAspectRatio="xMidYMid meet">
          <text x="50" y="4.3" textAnchor="middle" className={styles.tagline}>NOTHING ARTIFICIAL, NOTHING UNNECESSARY.</text>
        </svg>
      </span>
      {label && (
        <svg className={styles.count} viewBox="0 0 34 11">
          <rect x="1" y="1" width="32" height="9" rx="4.5" fill="#fff" />
          <text x="17" y="7.6" textAnchor="middle" className={styles.countText}>{label}</text>
        </svg>
      )}
      {children}
    </span>
  );
}
