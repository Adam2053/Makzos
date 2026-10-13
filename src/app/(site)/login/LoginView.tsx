"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { byId } from "@/lib/products";
import { useStore } from "@/lib/store";
import { SignIn } from "@/components/shop/SignIn";
import ui from "@/components/home/ui.module.css";
import styles from "./login.module.css";

const PHOTO = byId("sweet-tamarind");

export function LoginView({ next }: { next: string }) {
  const router = useRouter();
  const { user, ready, signOut } = useStore();

  return (
    <section className={styles.section}>
      <div className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.panel}>
          <h1 className={`${ui.display} ${styles.title}`}>{user ? `Hi, ${user.name.split(" ")[0]}.` : "Sign in."}</h1>
          {!ready ? null : user ? (
            <div className={styles.signed}>
              <p className={ui.lede}>You&rsquo;re signed in with {user.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}.</p>
              <div className={styles.actions}>
                <Link href={next} className={ui.btn}>Continue</Link>
                <button type="button" className={ui.btnLine} onClick={signOut}>Sign out</button>
              </div>
            </div>
          ) : (
            <>
              <p className={`${ui.lede} ${styles.lede}`}>Track orders, save addresses and check out faster. New here? The same steps make your account.</p>
              <SignIn onDone={() => router.push(next)} />
              <p className={styles.guest}>Just want to order? <Link href="/checkout" className={ui.link}>Check out as a guest</Link></p>
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
