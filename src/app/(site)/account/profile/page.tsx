"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { fmtPhone, useStore } from "@/lib/store";
import { updateProfile } from "@/app/actions/account";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "../account.module.css";

/** The name can change here. The email is the sign-in, so Shopify keeps it; receipts go there. */
export default function AccountProfile() {
  const { user } = useStore();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, start] = useTransition();
  if (!user) return null;

  const dirty = name.trim() !== user.name;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Add your name.");
    setError(null);
    start(async () => {
      const r = await updateProfile(name);
      if (!r.ok) return setError(r.message);
      setSaved(true);
      router.refresh();
    });
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
          <span className={forms.label}>Email</span>
          <p>{user.email ?? "No email on file"}</p>
          <p className={forms.hint}>You sign in with this email, and receipts go to it. To change it, write to hello@makzos.com.</p>
        </div>
        {user.phone && (
          <div className={forms.field}>
            <span className={forms.label}>Mobile number</span>
            <p>{fmtPhone(user.phone)}</p>
          </div>
        )}
        {error && <p className={forms.error} role="alert">{error}</p>}
        <div className={forms.actions}>
          <button type="submit" className={ui.btn} disabled={busy || !dirty}>{busy ? "Saving…" : "Save changes"}</button>
          {saved && !dirty && <span role="status" className={styles.quiet}>Saved.</span>}
        </div>
      </form>
    </>
  );
}
