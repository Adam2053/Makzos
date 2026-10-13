"use client";

import { useState } from "react";
import { Spinner } from "@/components/shop/bits";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./contact.module.css";

const KINDS = [
  { id: "wholesale", label: "Distributor or wholesaler", volume: "Monthly volume, in cartons" },
  { id: "stockist", label: "Stock it in my store", volume: "Stores you run" },
  { id: "bulk", label: "Bulk or corporate gifting", volume: "How many boxes" },
] as const;

/**
 * Wholesale is a form, not a portal (sitemap notes). One form for the three kinds of business
 * enquiry; #wholesale, #stockist and #bulk all land here.
 */
export function Business() {
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("wholesale");
  const [f, setF] = useState({ company: "", name: "", phone: "", email: "", city: "", gst: "", volume: "", note: "" });
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const k = KINDS.find((x) => x.id === kind)!;
  const set = (key: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [key]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.company.trim().length < 2) return setError("Add your business name.");
    if (f.name.trim().length < 2) return setError("Add a contact name.");
    if (!/^[6-9]\d{9}$/.test(f.phone)) return setError("Add a 10-digit mobile number. We'll call or WhatsApp.");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setError("Add an email for the price list.");
    if (!f.city.trim()) return setError("Add your city.");
    setError(null);
    setState("sending");
    window.setTimeout(() => setState("sent"), 900);
  };

  return (
    <section id="wholesale" className={styles.biz} aria-labelledby="biz-title">
      <span id="bulk" className={styles.anchor} />
      <span id="stockist" className={styles.anchor} />
      <div className={`${ui.shell} ${styles.bizGrid}`}>
        <div className={styles.bizCopy}>
          <h2 id="biz-title" className={`${ui.display} ${styles.bizTitle}`}>For businesses.</h2>
          <p className={styles.bizLede}>Distributors, stores and teams. Tell us a little and we&rsquo;ll send prices and terms within two working days.</p>
          <ul className={styles.bizList}>
            <li>Price lists and margins on request</li>
            <li>GST invoices on every order</li>
            <li>Gift sleeves with your note or logo, from 25 boxes</li>
          </ul>
        </div>
        {state === "sent" ? (
          <div className={styles.bizSent} role="status">
            <p className={ui.display}>Thanks, {f.name.split(" ")[0]}.</p>
            <span>We&rsquo;ll be in touch at {f.email} within two working days.</span>
          </div>
        ) : (
          <form className={`${forms.form} ${styles.bizForm}`} onSubmit={submit} noValidate>
            <div className={forms.segments} role="group" aria-label="What kind of business">
              {KINDS.map((x) => <button key={x.id} type="button" className={forms.segment} aria-pressed={kind === x.id} onClick={() => setKind(x.id)}>{x.label}</button>)}
            </div>
            <div className={forms.row}>
              <div className={forms.field}><label className={forms.label} htmlFor="b-co">Business name</label><input id="b-co" className={forms.input} autoComplete="organization" value={f.company} onChange={set("company")} /></div>
              <div className={forms.field}><label className={forms.label} htmlFor="b-nm">Your name</label><input id="b-nm" className={forms.input} autoComplete="name" value={f.name} onChange={set("name")} /></div>
            </div>
            <div className={forms.row}>
              <div className={forms.field}><label className={forms.label} htmlFor="b-ph">Mobile</label><input id="b-ph" className={forms.input} type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "") })} /></div>
              <div className={forms.field}><label className={forms.label} htmlFor="b-em">Email</label><input id="b-em" className={forms.input} type="email" autoComplete="email" value={f.email} onChange={set("email")} /></div>
            </div>
            <div className={forms.row3}>
              <div className={forms.field}><label className={forms.label} htmlFor="b-ci">City</label><input id="b-ci" className={forms.input} autoComplete="address-level2" value={f.city} onChange={set("city")} /></div>
              <div className={forms.field}><label className={forms.label} htmlFor="b-vo">{k.volume}</label><input id="b-vo" className={forms.input} inputMode="numeric" value={f.volume} onChange={set("volume")} /></div>
              <div className={forms.field}><label className={forms.label} htmlFor="b-gs">GSTIN <small>(optional)</small></label><input id="b-gs" className={forms.input} value={f.gst} onChange={(e) => setF({ ...f, gst: e.target.value.toUpperCase() })} maxLength={15} /></div>
            </div>
            <div className={forms.field}><label className={forms.label} htmlFor="b-no">Anything else <small>(optional)</small></label><textarea id="b-no" className={forms.input} rows={3} value={f.note} onChange={set("note")} /></div>
            {error && <p className={forms.error} role="alert">{error}</p>}
            <div className={forms.actions}><button type="submit" className={ui.btnPaprika} disabled={state === "sending"}>{state === "sending" ? <><Spinner /> Sending</> : "Send enquiry"}</button></div>
          </form>
        )}
      </div>
    </section>
  );
}
