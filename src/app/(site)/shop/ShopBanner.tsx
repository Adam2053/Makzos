import { BOX_PRICE, BAG_PRICE, FLAVOURS, WEIGHT, inr } from "@/lib/products";
import { Pack } from "@/components/shop/Pack";
import ui from "@/components/home/ui.module.css";
import styles from "./banner.module.css";

/**
 * The banner over the shop: printed like the pack's lower half (guide D4, packaging): a
 * Paprika field, the checkerboard edge, the headline, the tagline on a slanted black ribbon,
 * and the whole range fanned out on the right.
 */
export function ShopBanner() {
  return (
    <section className={styles.banner} aria-labelledby="shop-banner-title">
      <span className={styles.checks} aria-hidden="true" />
      <div className={`${ui.shell} ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={`${ui.label} ${styles.eyebrow}`}>{FLAVOURS.length} flavours · {WEIGHT} a bag</p>
          <h1 id="shop-banner-title" className={`${ui.display} ${styles.title}`}>Shop all flavours.</h1>
          <p className={styles.lede}>{inr(BAG_PRICE)} a bag. Any four count as a box, {inr(BOX_PRICE)}.</p>
        </div>
        <div className={styles.fan} aria-hidden="true">
          {FLAVOURS.map((f, i) => (
            <Pack key={f.id} id={f.id} sizes="160px" alt="" className={styles.pack} tilt={(i - (FLAVOURS.length - 1) / 2) * 7} />
          ))}
        </div>
      </div>
      <p className={styles.ribbon} aria-hidden="true"><span className={ui.label}>Nothing artificial. Nothing unnecessary. Nothing artificial. Nothing unnecessary. Nothing artificial. Nothing unnecessary.</span></p>
    </section>
  );
}
