"use client";

import Image from "next/image";
import { useState } from "react";
import { BOX_PRICE, BOX_SIZE, FEATURED, PACK_H, PACK_W, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import ui from "./ui.module.css";
import styles from "./Gift.module.css";

const MAX = 120;

/**
 * Send a box with a note. The sleeve on the left is the guide's gift sleeve (p.35),
 * and it writes itself as you type.
 */
export function Gift() {
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);
  const { addBox } = useCart();
  const ids = FEATURED.map((f) => f.id).slice(0, BOX_SIZE);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = [to && `To ${to}`, note].filter(Boolean).join(": ");
    addBox(ids, document.querySelector<HTMLElement>(`.${styles.sleeve}`), message || "A flavour worth sharing.");
    setAdded(true);
  };

  return (
    <section id="gift" className={styles.section} aria-labelledby="gift-title">
      <div className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.preview} aria-hidden="true">
          <div className={styles.packs}>
            {FEATURED.map((f, i) => <Image key={f.id} src={f.pack} alt="" width={PACK_W} height={PACK_H} sizes="120px" style={{ "--i": i - 1.5 } as React.CSSProperties} />)}
          </div>
          <div className={styles.sleeve}>
            <Image src="/brand/logo-dark.png" alt="" width={1200} height={296} className={styles.sleeveLogo} />
            <p className={styles.sleeveLine}>A flavour worth sharing.</p>
            <div className={styles.tag}>
              <p className={styles.tagTo}>To {to.trim() || "someone good"}</p>
              <p className={styles.tagNote}>{note.trim() || "Your note goes here."}</p>
            </div>
          </div>
        </div>

        <div className={styles.copy}>
          <h2 id="gift-title" className={`${ui.display} ${styles.title}`}>Send a box with a note.</h2>
          <p className={`${ui.lede} ${styles.lede}`}>{FEATURED.map((f) => f.name).join(", ")}, in a Paprika gift sleeve with your message on it.</p>
          <form className={styles.form} onSubmit={submit}>
            <label className={styles.field}>
              <span>Who&rsquo;s it for?</span>
              <input value={to} onChange={(e) => { setTo(e.target.value.slice(0, 32)); setAdded(false); }} placeholder="Their name" autoComplete="off" />
            </label>
            <label className={styles.field}>
              <span>Your note <em>{note.length}/{MAX}</em></span>
              <textarea value={note} onChange={(e) => { setNote(e.target.value.slice(0, MAX)); setAdded(false); }} rows={3} placeholder="Happy housewarming. Save me the Tiramisu." />
            </label>
            <button type="submit" className={ui.btn}>{added ? "Added. Add another" : `Add gift box, ${inr(BOX_PRICE)}`}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
