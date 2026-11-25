"use client";

import { useState } from "react";
import { loginHref } from "@/lib/store";
import ui from "@/components/home/ui.module.css";
import forms from "./forms.module.css";
import { Spinner } from "./bits";

/**
 * Sign in or make an account, both through Shopify: it emails a six-digit code, no password,
 * and the same account works at checkout. New emails get an account on the way. `next` is
 * where the shopper lands afterwards.
 */
export function SignIn({ next = "/account", buttonClass }: { next?: string; buttonClass?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className={forms.form}>
      <a href={loginHref(next)} className={buttonClass ?? ui.btn} onClick={() => setBusy(true)} aria-busy={busy || undefined}>
        {busy ? <><Spinner /> Opening sign-in</> : "Sign in with email"}
      </a>
      <p className={forms.hint}>We&rsquo;ll email you a six-digit code. New here? The same step makes your account.</p>
    </div>
  );
}
