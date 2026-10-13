"use client";

import { useState } from "react";
import type { Address } from "@/lib/store";
import { BLOCKED_PINCODE, serviceFor } from "@/lib/pricing";
import ui from "@/components/home/ui.module.css";
import forms from "./forms.module.css";

type Draft = Omit<Address, "id"> & { id?: string };
type Errors = Partial<Record<keyof Draft, string>>;

const LABELS: Address["label"][] = ["Home", "Work", "Other"];

/** The cities we know from a pincode's first three digits. */
const CITY_BY_PREFIX: [RegExp, string, string][] = [
  [/^50[0-2]/, "Hyderabad", "Telangana"],
  [/^56[0-2]/, "Bengaluru", "Karnataka"],
];

export const blankAddress = (name = "", phone = ""): Draft => ({ label: "Home", name, phone, line1: "", line2: "", landmark: "", city: "", state: "", pincode: "" });

function validate(a: Draft, requireService: boolean): Errors {
  const e: Errors = {};
  if (a.name.trim().length < 2) e.name = "Add the name of the person receiving it.";
  if (!/^[6-9]\d{9}$/.test(a.phone)) e.phone = "Enter a 10-digit mobile number. The courier calls this one.";
  if (!/^\d{6}$/.test(a.pincode)) e.pincode = "Pincodes are six digits.";
  else if (requireService && !serviceFor(a.pincode).ok) e.pincode = serviceFor(a.pincode).message;
  if (a.line1.trim().length < 3) e.line1 = "Add the flat or house number and building.";
  if (!a.line2?.trim()) e.line2 = "Add the street or area.";
  if (!a.city.trim()) e.city = "Add the city.";
  if (!a.state.trim()) e.state = "Add the state.";
  return e;
}

/**
 * One address, new or being edited. The pincode fills in the city and state where it can,
 * and checkout refuses pincodes we don't deliver to yet, saying why.
 */
export function AddressForm({ initial, onSave, onCancel, submitLabel = "Save address", requireService = false, showDefault = true, submitClass }: {
  initial: Draft; onSave: (a: Draft) => void; onCancel?: () => void; submitLabel?: string; requireService?: boolean; showDefault?: boolean;
  /** Lets checkout give the submit button its own, full-width style. */
  submitClass?: string;
}) {
  const [a, setA] = useState<Draft>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => { setA((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const pin = (v: string) => {
    const p = v.replace(/\D/g, "").slice(0, 6);
    const hit = CITY_BY_PREFIX.find(([re]) => re.test(p));
    setA((x) => ({ ...x, pincode: p, ...(hit && p.length === 6 ? { city: hit[1], state: hit[2] } : {}) }));
    setErrors((e) => ({ ...e, pincode: undefined, city: undefined, state: undefined }));
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(a, requireService);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) { document.getElementById(`ad-${first}`)?.focus(); return; }
    onSave({ ...a, name: a.name.trim(), line1: a.line1.trim(), line2: a.line2?.trim(), landmark: a.landmark?.trim() || undefined });
  };

  const field = (k: keyof Draft, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, optional = false) => (
    <div className={forms.field}>
      <label className={forms.label} htmlFor={`ad-${k}`}>{label}{optional && <small> (optional)</small>}</label>
      <input id={`ad-${k}`} className={forms.input} value={(a[k] as string) ?? ""} onChange={(e) => set(k, e.target.value as never)}
        aria-invalid={errors[k] ? true : undefined} aria-describedby={errors[k] ? `ad-${k}-e` : undefined} {...props} />
      {errors[k] && <p id={`ad-${k}-e`} className={forms.error}>{errors[k]}</p>}
    </div>
  );

  return (
    <form className={forms.form} onSubmit={submit} noValidate>
      <div className={forms.field}>
        <span className={forms.label} id="ad-label">Save as</span>
        <div className={forms.segments} role="group" aria-labelledby="ad-label">
          {LABELS.map((l) => <button key={l} type="button" className={forms.segment} aria-pressed={a.label === l} onClick={() => set("label", l)}>{l}</button>)}
        </div>
      </div>
      <div className={forms.row}>
        {field("name", "Full name", { autoComplete: "name" })}
        <div className={forms.field}>
          <label className={forms.label} htmlFor="ad-phone">Mobile number</label>
          <input id="ad-phone" className={forms.input} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={a.phone}
            onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} aria-invalid={errors.phone ? true : undefined} aria-describedby={errors.phone ? "ad-phone-e" : undefined} />
          {errors.phone && <p id="ad-phone-e" className={forms.error}>{errors.phone}</p>}
        </div>
      </div>
      <div className={forms.field}>
        <label className={forms.label} htmlFor="ad-pincode">Pincode</label>
        <input id="ad-pincode" className={`${forms.input} ${forms.short}`} inputMode="numeric" autoComplete="postal-code" maxLength={6} value={a.pincode} onChange={(e) => pin(e.target.value)}
          aria-invalid={errors.pincode ? true : undefined} aria-describedby="ad-pincode-e" />
        {errors.pincode ? <p id="ad-pincode-e" className={forms.error}>{errors.pincode}</p> : <p id="ad-pincode-e" className={forms.hint}>We fill in the city where we can. Demo: {BLOCKED_PINCODE} shows a pincode we can&rsquo;t deliver to.</p>}
      </div>
      {field("line1", "Flat, house number, building", { autoComplete: "address-line1", placeholder: "Flat 402, Lakeview Residency" })}
      {field("line2", "Street and area", { autoComplete: "address-line2", placeholder: "Road No. 12, Banjara Hills" })}
      {field("landmark", "Landmark", { placeholder: "Opposite the park" }, true)}
      <div className={forms.row}>
        {field("city", "City", { autoComplete: "address-level2" })}
        {field("state", "State", { autoComplete: "address-level1" })}
      </div>
      {showDefault && (
        <label className={forms.check}>
          <input type="checkbox" checked={!!a.isDefault} onChange={(e) => set("isDefault", e.target.checked)} />
          Use this as my default address
        </label>
      )}
      <div className={forms.actions}>
        <button type="submit" className={submitClass ?? ui.btn}>{submitLabel}</button>
        {onCancel && <button type="button" className={`${ui.link} ${forms.textBtn}`} onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
