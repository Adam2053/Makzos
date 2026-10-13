"use client";

import Link from "next/link";
import { useState } from "react";
import { BAG_PRICE, SUB_EVERY, SUB_OFF, boxPrice, byId, inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { Pack } from "@/components/shop/Pack";
import { Makhana } from "@/components/home/Makhana";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./box.module.css";

/** Subscribe & save: what it is, in three steps that really are steps. */
export function Subscribe() {
  const STEPS = [
    { t: "Choose what comes", d: "Any box, or a single flavour by the bag or pack of three." },
    { t: "Choose how often", d: `Every ${SUB_EVERY.join(", ").replace(/, (\d+)$/, " or $1")} weeks. ${SUB_OFF}% off every delivery.` },
    { t: "Change it any time", d: "Skip a delivery, swap flavours, pause or cancel from your account. No calls, no fees." },
  ];
  return (
    <section id="subscribe" className={styles.sub} aria-labelledby="sub-title">
      <div className={`${ui.shell} ${styles.subGrid}`}>
        <div>
          <h2 id="sub-title" className={`${ui.display} ${styles.h2}`}>Subscribe and save {SUB_OFF}%.</h2>
          <p className={`${ui.lede} ${styles.quiet}`}>The bag you keep running out of, on a schedule. Pick &ldquo;Subscribe&rdquo; on any flavour, or on your box above.</p>
          <Link href="/shop" className={ui.btnLine}>Pick a flavour</Link>
        </div>
        <ol className={styles.steps}>
          {STEPS.map((s) => <li key={s.t}><strong className={ui.display}>{s.t}</strong><span>{s.d}</span></li>)}
        </ol>
      </div>
    </section>
  );
}

const HAMPERS: { id: string; name: string; dek: string; ids: string[] }[] = [
  { id: "taster", name: "The taster", dek: "One of every flavour. The best first order.", ids: ["rasam", "sweet-tamarind", "mac-cheese", "tiramisu", "curry-leaves", "chettinadu", "thai-chilli"] },
  { id: "south", name: "Southern classics", dek: "Rasam, curry leaves, Chettinadu and tamarind.", ids: ["rasam", "curry-leaves", "chettinadu", "sweet-tamarind"] },
  { id: "sweet", name: "The sweet side", dek: "Two Tiramisu, two Sweet Tamarind.", ids: ["tiramisu", "tiramisu", "sweet-tamarind", "sweet-tamarind"] },
  { id: "comfort", name: "Comfort food", dek: "Mac & Cheese, Tiramisu, Rasam, and a little heat.", ids: ["mac-cheese", "tiramisu", "rasam", "thai-chilli", "mac-cheese"] },
];

/** Ready-made boxes, each one a gift with a note if you want it to be. */
export function Hampers() {
  const { addBox, setOpen } = useCart();
  const [gift, setGift] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [added, setAdded] = useState<string | null>(null);

  return (
    <section id="gifting" className={styles.gifting} aria-labelledby="gift-title">
      <div className={ui.shell}>
        <header className={styles.head}>
          <h2 id="gift-title" className={`${ui.display} ${styles.h2}`}>Gifting and hampers.</h2>
          <p className={`${ui.lede} ${styles.quiet}`}>Ready-made boxes. Add a note and we&rsquo;ll print it on the sleeve and leave the prices out.</p>
        </header>
        <ul className={styles.hampers}>
          {HAMPERS.map((h) => {
            const unique = [...new Set(h.ids)];
            const price = boxPrice(h.ids.length);
            return (
              <li key={h.id} className={styles.hamper}>
                <div className={styles.fan} aria-hidden="true">
                  {unique.slice(0, 4).map((id, i, arr) => (
                    <Pack key={id} id={id} sizes="110px" alt="" className={styles.fanPack} tilt={(i - (arr.length - 1) / 2) * 8} />
                  ))}
                </div>
                <h3 className={`${ui.display} ${styles.hName}`}>{h.name}</h3>
                <p className={styles.hDek}>{h.dek}</p>
                <p className={styles.hMeta}>{h.ids.length} bags. {h.ids.map((id) => byId(id).name).filter((v, i, a) => a.indexOf(v) === i).length} flavours.</p>
                <p className={styles.hPrice}><strong className={ui.display}>{inr(price)}</strong> <s>{inr(h.ids.length * BAG_PRICE)}</s></p>
                {gift === h.id && (
                  <div className={forms.field}>
                    <label className={forms.label} htmlFor={`note-${h.id}`}>Note on the sleeve</label>
                    <textarea id={`note-${h.id}`} className={forms.input} rows={2} maxLength={120} value={note} onChange={(e) => setNote(e.target.value)} />
                  </div>
                )}
                <div className={styles.hActions}>
                  {added === h.id ? (
                    <p className={styles.done} role="status">In your bag. <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setOpen(true)}>View bag</button></p>
                  ) : (
                    <button type="button" className={ui.btnPaprika} onClick={(e) => {
                      addBox(h.ids, e.currentTarget.closest("li")?.querySelector("img"), gift === h.id && note.trim() ? note.trim() : undefined);
                      setAdded(h.id); setGift(null); setNote("");
                    }}>Add {gift === h.id ? "gift" : "box"}</button>
                  )}
                  {gift !== h.id && added !== h.id && <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => { setGift(h.id); setNote(""); }}>Send as a gift</button>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className={styles.bulk}>
          <div>
            <h3 className={`${ui.display} ${styles.h3}`}>Gifting for a team or an event?</h3>
            <p className={styles.quiet}>Corporate gifting and bulk orders from 25 boxes, with your note or logo on the sleeve.</p>
          </div>
          <Link href="/contact#bulk" className={ui.btn}>Ask about bulk orders</Link>
        </div>
      </div>
    </section>
  );
}

const SOON = [
  { id: "trial", name: "Trial packs", dek: "Smaller bags of every flavour, to find your favourite." },
  { id: "family", name: "Family size", dek: "A bigger bag of the one everyone fights over." },
  { id: "cookies", name: "Makhana cookies", dek: "Four flavours, in the works." },
];

/** What's coming, with a way to hear first. Requirements form: trial, family size, cookies. */
export function Soon() {
  const [want, setWant] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section className={`${ui.shell} ${styles.soon}`} aria-labelledby="soon-title">
      <h2 id="soon-title" className={`${ui.display} ${styles.h2}`}>Coming soon.</h2>
      <ul className={styles.soonList}>
        {SOON.map((s) => (
          <li key={s.id}>
            <label className={styles.soonItem}>
              <input type="checkbox" checked={want.includes(s.id)} onChange={(e) => setWant((w) => (e.target.checked ? [...w, s.id] : w.filter((x) => x !== s.id)))} />
              <Makhana variant="outline" className={styles.soonSeed} />
              <strong className={ui.display}>{s.name}</strong>
              <span>{s.dek}</span>
            </label>
          </li>
        ))}
      </ul>
      {sent ? (
        <p className={styles.done} role="status">We&rsquo;ll email {email} the day they launch.</p>
      ) : (
        <form className={`${forms.inline} ${styles.soonForm}`} onSubmit={(e) => { e.preventDefault(); if (want.length && /^\S+@\S+\.\S+$/.test(email)) setSent(true); }}>
          <label htmlFor="soon-email" className={ui.sr}>Email</label>
          <input id="soon-email" className={forms.input} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className={ui.btn} disabled={!want.length}>{want.length ? `Tell me about ${want.length === 1 ? "it" : "them"}` : "Tick what you want first"}</button>
        </form>
      )}
    </section>
  );
}
