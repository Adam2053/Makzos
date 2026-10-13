"use client";

import { useState } from "react";
import { fmtPhone, useStore } from "@/lib/store";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "../account.module.css";

/** Name and email can change here; the phone number is the sign-in, so it stays put. */
export default function AccountProfile() {
  const { user, updateProfile } = useStore();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [news, setNews] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  if (!user) return null;

  const dirty = name !== user.name || email !== (user.email ?? "");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Add your name.");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return setError("That email doesn't look right. Check for a missing @ or dot.");
    setError(null);
    updateProfile({ name: name.trim(), email: email.trim() });
    setSaved(true);
  };

  return (
    <>
      <header>
        <h1 className={`${ui.display} ${styles.title}`}>Profile.</h1>
        <p className={styles.sub}>How we greet you, and where receipts go.</p>
      </header>
      <form className={`${forms.form} ${styles.panel} ${styles.narrow}`} onSubmit={save} noValidate>
        <div className={forms.field}>
          <label className={forms.label} htmlFor="p-name">Name</label>
          <input id="p-name" className={forms.input} autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
        </div>
        <div className={forms.field}>
          <label className={forms.label} htmlFor="p-email">Email</label>
          <input id="p-email" className={forms.input} type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setSaved(false); }} />
        </div>
        <div className={forms.field}>
          <span className={forms.label}>Mobile number</span>
          <p>{fmtPhone(user.phone)}</p>
          <p className={forms.hint}>You sign in with this number. To change it, write to hello@makzos.com.</p>
        </div>
        <label className={forms.check}>
          <input type="checkbox" checked={news} onChange={(e) => { setNews(e.target.checked); setSaved(false); }} />
          Email me about new flavours and launch days
        </label>
        {error && <p className={forms.error} role="alert">{error}</p>}
        <div className={forms.actions}>
          <button type="submit" className={ui.btn} disabled={!dirty && saved}>Save changes</button>
          {saved && <span role="status" className={styles.quiet}>Saved.</span>}
        </div>
      </form>
    </>
  );
}
