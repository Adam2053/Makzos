"use client";

import { useState } from "react";
import { addressLines, fmtPhone, useStore, type Address } from "@/lib/store";
import { AddressForm, blankAddress } from "@/components/shop/AddressForm";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "../account.module.css";

/** Saved addresses: add, edit, remove, and choose the default checkout picks first. */
export default function AccountAddresses() {
  const { user, addresses, saveAddress, removeAddress, setDefaultAddress } = useStore();
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  if (!user) return null;

  return (
    <>
      <header className={styles.row}>
        <div>
          <h1 className={`${ui.display} ${styles.title}`}>Addresses.</h1>
          <p className={styles.sub}>Checkout starts with your default.</p>
        </div>
        {!editing && <button type="button" className={ui.btn} onClick={() => { setEditing("new"); setNotice(null); }}>Add an address</button>}
      </header>

      {notice && <p className={styles.quiet} role="status">{notice}</p>}

      {editing && (
        <div className={styles.panel}>
          <h2 className={`${ui.display} ${styles.h2} ${styles.panelTitle}`}>{editing === "new" ? "New address" : `Edit ${editing.label.toLowerCase()} address`}</h2>
          <AddressForm
            initial={editing === "new" ? { ...blankAddress(user.name, user.phone), isDefault: addresses.length === 0 } : editing}
            onCancel={() => setEditing(null)}
            onSave={(a) => { saveAddress(a); setEditing(null); setNotice(editing === "new" ? "Address saved." : "Changes saved."); }} />
        </div>
      )}

      {addresses.length === 0 && !editing ? (
        <div className={styles.emptyBox}>
          <p>No saved addresses. Add one now, or save one at checkout.</p>
        </div>
      ) : (
        <div className={styles.cards}>
          {addresses.map((a) => (
            <article key={a.id} className={styles.card}>
              <div className={styles.cardTop}>
                <strong>{a.label}</strong>
                {a.isDefault && <span className={styles.tag}>Default</span>}
              </div>
              <span>{a.name}, {fmtPhone(a.phone)}</span>
              {addressLines(a).map((l) => <span key={l}>{l}</span>)}
              {confirm === a.id ? (
                <div className={styles.cardActions} role="alert">
                  <span>Remove this address?</span>
                  <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => { removeAddress(a.id); setConfirm(null); setNotice("Address removed."); }}>Remove</button>
                  <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setConfirm(null)}>Keep</button>
                </div>
              ) : (
                <div className={styles.cardActions}>
                  <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => { setEditing(a); setNotice(null); }}>Edit</button>
                  {!a.isDefault && <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={() => setDefaultAddress(a.id)}>Make default</button>}
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
