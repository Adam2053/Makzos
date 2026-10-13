"use client";

import { useEffect, useRef, useState } from "react";
import { fmtPhone, useStore } from "@/lib/store";
import ui from "@/components/home/ui.module.css";
import forms from "./forms.module.css";
import { Spinner } from "./bits";
import styles from "./SignIn.module.css";

type Step = "phone" | "code" | "profile";

const RESEND_AFTER = 30;

/**
 * Sign in with a phone number and a one-time code, the way Indian shoppers expect to.
 * New numbers get one more step for a name. Demo rules: any six digits sign you in,
 * 000000 shows the wrong-code state. `onDone` runs once someone is signed in.
 */
export function SignIn({ onDone, compact = false, buttonClass }: { onDone: () => void; compact?: boolean; buttonClass?: string }) {
  const btn = buttonClass ?? ui.btn;
  const { verifyOtp, completeProfile } = useStore();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  // The resend countdown.
  useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  /** Pretends to talk to the server for a moment, so the waiting state can be seen. */
  const later = (fn: () => void, ms = 700) => { setBusy(true); window.setTimeout(() => { setBusy(false); fn(); }, ms); };

  const sendCode = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a 10-digit mobile number starting with 6, 7, 8 or 9.");
    setError(null);
    later(() => {
      setStep("code");
      setDigits(Array(6).fill(""));
      setWait(RESEND_AFTER);
      window.setTimeout(() => boxes.current[0]?.focus(), 30);
    });
  };

  const verify = (code = digits.join("")) => {
    later(() => {
      const r = verifyOtp(phone, code);
      if (!r.ok) {
        setError(r.message);
        setDigits(Array(6).fill(""));
        boxes.current[0]?.focus();
        return;
      }
      setError(null);
      if (r.isNew) setStep("profile");
      else onDone();
    }, 800);
  };

  /** One digit per box; typing moves on, Backspace moves back, a pasted code fills them all. */
  const type = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "");
    if (clean.length > 1) {
      const next = clean.slice(0, 6).split("").concat(Array(6).fill("")).slice(0, 6);
      setDigits(next);
      boxes.current[Math.min(clean.length, 5)]?.focus();
      if (clean.length >= 6) verify(next.join(""));
      return;
    }
    const next = digits.map((d, j) => (j === i ? clean : d));
    setDigits(next);
    setError(null);
    if (clean && i < 5) boxes.current[i + 1]?.focus();
    if (next.every(Boolean)) verify(next.join(""));
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Add your name, so we know who to deliver to.");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return setError("That email doesn't look right. Check for a missing @ or dot.");
    setError(null);
    later(() => { completeProfile({ name: name.trim(), email: email.trim() }); onDone(); }, 500);
  };

  return (
    <div className={styles.wrap} data-compact={compact || undefined}>
      {step === "phone" && (
        <form className={forms.form} onSubmit={sendCode} noValidate>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="si-phone">Mobile number</label>
            <div className={styles.phone}>
              <span aria-hidden="true">+91</span>
              <input id="si-phone" className={forms.input} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10}
                placeholder="98765 43210" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(null); }}
                aria-invalid={error ? true : undefined} aria-describedby="si-phone-note" />
            </div>
            <p id="si-phone-note" className={error ? forms.error : forms.hint} role={error ? "alert" : undefined}>
              {error ?? "We'll text you a six-digit code. No password to remember."}
            </p>
          </div>
          <button type="submit" className={btn} disabled={busy}>{busy ? <><Spinner /> Sending code</> : "Send code"}</button>
        </form>
      )}

      {step === "code" && (
        <div className={forms.form}>
          <div className={forms.field}>
            <p className={forms.label} id="si-code-label">Code sent to {fmtPhone(phone)}</p>
            <div className={styles.code} role="group" aria-labelledby="si-code-label">
              {digits.map((d, i) => (
                <input key={i} ref={(el) => { boxes.current[i] = el; }} className={styles.digit} inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={i === 0 ? 6 : 1} value={d} aria-label={`Digit ${i + 1}`} aria-invalid={error ? true : undefined} disabled={busy}
                  onChange={(e) => type(i, e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) boxes.current[i - 1]?.focus(); }} />
              ))}
            </div>
            <p className={error ? forms.error : forms.hint} role={error ? "alert" : "status"}>
              {busy ? "Checking…" : error ?? "Demo: any six digits work. 000000 shows a wrong code."}
            </p>
          </div>
          <div className={styles.row}>
            <button type="button" className={ui.link} onClick={() => { setStep("phone"); setError(null); }}>Change number</button>
            {wait > 0
              ? <span className={forms.hint}>Send again in 0:{String(wait).padStart(2, "0")}</span>
              : <button type="button" className={ui.link} onClick={() => sendCode()}>Send a new code</button>}
          </div>
        </div>
      )}

      {step === "profile" && (
        <form className={forms.form} onSubmit={saveProfile} noValidate>
          <p className={styles.welcome}>New here. Welcome. Just your name, and you&rsquo;re in.</p>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="si-name">Your name</label>
            <input id="si-name" className={forms.input} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="si-email">Email <small>(optional, for receipts)</small></label>
            <input id="si-email" className={forms.input} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p className={forms.error} role="alert">{error}</p>}
          <button type="submit" className={btn} disabled={busy}>{busy ? <><Spinner /> Creating account</> : "Create account"}</button>
        </form>
      )}
    </div>
  );
}
