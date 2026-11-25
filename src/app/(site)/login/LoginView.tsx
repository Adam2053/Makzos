"use client";

import Image from "next/image";
import Link from "next/link";
import { byId } from "@/lib/products";
import { useStore } from "@/lib/store";
import { SignIn } from "@/components/shop/SignIn";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./login.module.css";

const PHOTO = byId("sweet-tamarind");

const ERRORS: Record<string, string> = {
  cancelled: "Sign-in was cancelled. Try again whenever you're ready.",
  failed: "That sign-in didn't go through. Please try again.",
  unavailable: "Sign-in is unavailable right now. You can still check out as a guest.",
};

export function LoginView({ next, error }: { next: string; error?: string }) {
  const { user, ready, signOut } = useStore();

  return (
    <section className={styles.section}>
      <div className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.panel}>
          <h1 className={`${ui.display} ${styles.title}`}>{user ? `Hi, ${user.name.split(" ")[0]}.` : "Sign in."}</h1>
          {!ready ? null : user ? (
            <div className={styles.signed}>
              <p className={ui.lede}>You&rsquo;re signed in{user.email ? ` as ${user.email}` : ""}.</p>
              <div className={styles.actions}>
                <Link href={next} className={ui.btn}>Continue</Link>
                <button type="button" className={ui.btnLine} onClick={signOut}>Sign out</button>
              </div>
            </div>
          ) : (
            <>
              <p className={`${ui.lede} ${styles.lede}`}>Track orders, save addresses and check out faster. New here? The same step makes your account.</p>
              {error && ERRORS[error] && <p className={forms.error} role="alert">{ERRORS[error]}</p>}
              <SignIn next={next} />
              <p className={styles.guest}>Just want to order? <Link href="/cart" className={ui.link}>Check out as a guest</Link></p>
            </>
          )}
        </div>
        <figure className={styles.photo} style={{ "--field": PHOTO.field } as React.CSSProperties} aria-hidden="true">
          <Image src={PHOTO.dish.src} alt="" fill sizes="(max-width: 900px) 1px, 45vw" style={{ objectPosition: `${PHOTO.dish.spot[0] * 100}% ${PHOTO.dish.spot[1] * 100}%` }} />
          <figcaption className={ui.display}>{PHOTO.line}</figcaption>
        </figure>
      </div>
    </section>
  );
}
