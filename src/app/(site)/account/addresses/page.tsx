"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addressLines, fmtPhone, useStore, type Address } from "@/lib/store";
import { removeAddress, saveAddress, setDefaultAddress } from "@/app/actions/account";
import { AddressForm, blankAddress } from "@/components/shop/AddressForm";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "../account.module.css";

/** Saved addresses, kept in Shopify: add, edit, remove, and choose the default checkout fills in. */
export default function AccountAddresses() {
  const { user, addresses } = useStore();
  const router = useRouter();
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();
  if (!user) return null;

  /** Runs a change in Shopify, then re-reads the account so the list is Shopify's. */
  const run = (action: () => Promise<{ ok: true } | { ok: false; message: string }>, done: string, after?: () => void) =>
    start(async () => {
      const r = await action();
      if (!r.ok) return setError(r.message);
      setError(null);
      setNotice(done);
      after?.();
      router.refresh();
    });

  return (
    <>
      <header className={styles.row}>
        <div>
          <h1 className={`${ui.display} ${styles.title}`}>Addresses.</h1>
          <p className={styles.sub}>Checkout starts with your default.</p>
        </div>
        {!editing && <button type="button" className={ui.btn} onClick={() => { setEditing("new"); setNotice(null); setError(null); }}>Add an address</button>}
      </header>

      {notice && <p className={styles.quiet} role="status">{notice}</p>}
      {error && <p className={forms.error} role="alert">{error}</p>}

      {editing && (
        <div className={styles.panel}>
          <h2 className={`${ui.display} ${styles.h2} ${styles.panelTitle}`}>{editing === "new" ? "New address" : "Edit address"}</h2>
          <AddressForm
            busy={busy}
            initial={editing === "new" ? { ...blankAddress(user.name, user.phone ?? ""), isDefault: addresses.length === 0 } : editing}
            onCancel={() => setEditing(null)}
            onSave={(a) => run(() => saveAddress(a), editing === "new" ? "Address saved." : "Changes saved.", () => setEditing(null))} />
        </div>
      )}

      {addresses.length === 0 && !editing ? (
        <div className={styles.emptyBox}>
          <p>No saved addresses. Add one now, or save one at checkout.</p>
        </div>
      ) : (
        <div className={styles.cards} aria-busy={busy || undefined}>
          {addresses.map((a) => (
            <article key={a.id} className={styles.card}>
              <div className={styles.cardTop}>
                <strong>{a.name}</strong>
                {a.isDefault && <span className={styles.tag}>Default</span>}
              </div>
              <span>{fmtPhone(a.phone)}</span>
              {addressLines(a).map((l) => <span key={l}>{l}</span>)}
              {confirm === a.id ? (
                <div className={styles.cardActions} role="alert">
                  <span>Remove this address?</span>
                  <button type="button" className={`${ui.link} ${forms.textBtn}`} disabled={busy} onClick={() => run(() => removeAddress(a.id), "Address removed.", () => setConfirm(null))}>Remove</button>
                  <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setConfirm(null)}>Keep</button>
                </div>
              ) : (
                <div className={styles.cardActions}>
                  <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => { setEditing(a); setNotice(null); setError(null); }}>Edit</button>
                  {!a.isDefault && <button type="button" className={`${ui.link} ${forms.textBtn}`} disabled={busy} onClick={() => run(() => setDefaultAddress(a.id), "Default address changed.")}>Make default</button>}
                  <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setConfirm(a.id)}>Remove</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
