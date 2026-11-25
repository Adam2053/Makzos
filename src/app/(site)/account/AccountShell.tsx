"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountProvider, fmtPhone, useStore, type AccountData } from "@/lib/store";
import { SignIn } from "@/components/shop/SignIn";
import ui from "@/components/home/ui.module.css";
import styles from "./account.module.css";

const NAV = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/subscriptions", label: "Subscriptions" },
  { href: "/account/saved", label: "Saved" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/profile", label: "Profile" },
];

/** Every account page sits in this frame: the side nav, or the sign-in when nobody is. */
export function AccountShell({ data, children }: { data: AccountData | null; children: React.ReactNode }) {
  const { signOut } = useStore();
  const path = usePathname();

  if (!data) {
    return (
      <section className={`${ui.shell} ${styles.gate}`}>
        <h1 className={`${ui.display} ${styles.gateTitle}`}>Sign in to see your account.</h1>
        <p className={`${ui.lede} ${styles.quiet}`}>Your orders, addresses and details live here.</p>
        <div className={styles.gateForm}><SignIn next={path} /></div>
      </section>
    );
  }

  const user = data.user;
  return (
    <AccountProvider data={data}>
    <div className={`${ui.shell} ${styles.frame}`}>
      <aside className={styles.side}>
        <p className={styles.hello}>
          <span className={styles.avatar} aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
          <span><strong>{user.name}</strong><span>{user.email ?? fmtPhone(user.phone)}</span></span>
        </p>
        <nav aria-label="Account" className={styles.nav}>
          {NAV.map((n) => {
            const on = n.href === "/account" ? path === n.href : path.startsWith(n.href);
            return <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined}>{n.label}</Link>;
          })}
          <button type="button" onClick={signOut}>Sign out</button>
        </nav>
      </aside>
      <div className={styles.body}>{children}</div>
    </div>
    </AccountProvider>
  );
}
