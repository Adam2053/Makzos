"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHead, Spinner } from "@/components/shop/bits";
import { Makhana } from "@/components/home/Makhana";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./contact.module.css";

const TOPICS = ["An order", "A damaged or missing pack", "A subscription", "Press and partnerships", "Something else"];

/** Write to us. The order number field appears only for order questions, prefilled from the latest. */
export function ContactView() {
  const { user, orders } = useStore();
  const [topic, setTopic] = useState(TOPICS[0]);
  // null until typed in: until then the account's details fill the fields.
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [order, setOrder] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const aboutOrder = topic === TOPICS[0] || topic === TOPICS[1];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const who = name ?? user?.name ?? "";
    const mail = email ?? user?.email ?? "";
    if (who.trim().length < 2) return setError("Add your name.");
    if (!/^\S+@\S+\.\S+$/.test(mail)) return setError("Add an email we can reply to.");
    if (message.trim().length < 10) return setError("Tell us a little more, so we can help in one reply.");
    setError(null);
    setState("sending");
    window.setTimeout(() => setState("sent"), 900);
  };

  return (
    <>
      <PageHead title="Write to us." lede="A real person replies, usually within one working day." crumbs={[{ href: "/", label: "Home" }, { label: "Contact" }]} />
      <section className={`${ui.shell} ${styles.grid}`}>
        {state === "sent" ? (
          <div className={styles.sent} role="status">
            <Makhana variant="fill" className={styles.seed} />
            <p className={ui.display}>Message sent.</p>
            <span>We&rsquo;ll reply to {email ?? user?.email}. Thanks for writing.</span>
            <Link href="/shop" className={ui.link}>Back to the shop</Link>
          </div>
        ) : (
          <form className={`${forms.form} ${styles.form}`} onSubmit={submit} noValidate>
            <div className={forms.field}>
              <span className={forms.label} id="ct-topic">What&rsquo;s it about?</span>
              <div className={forms.segments} role="group" aria-labelledby="ct-topic">
                {TOPICS.map((t) => (
                  <button key={t} type="button" className={forms.segment} aria-pressed={topic === t}
                    onClick={() => { setTopic(t); if ((t === TOPICS[0] || t === TOPICS[1]) && !order && orders[0]) setOrder(orders[0].id); }}>{t}</button>
                ))}
              </div>
            </div>
            <div className={forms.row}>
              <div className={forms.field}>
                <label className={forms.label} htmlFor="ct-name">Name</label>
                <input id="ct-name" className={forms.input} autoComplete="name" value={name ?? user?.name ?? ""} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className={forms.field}>
                <label className={forms.label} htmlFor="ct-email">Email</label>
                <input id="ct-email" className={forms.input} type="email" autoComplete="email" value={email ?? user?.email ?? ""} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            {aboutOrder && (
              <div className={forms.field}>
                <label className={forms.label} htmlFor="ct-order">Order number <small>(if you have it)</small></label>
                <input id="ct-order" className={`${forms.input} ${forms.short}`} placeholder="MKZ12345" value={order} onChange={(e) => setOrder(e.target.value.toUpperCase())} />
              </div>
            )}
            <div className={forms.field}>
              <label className={forms.label} htmlFor="ct-msg">Message</label>
              <textarea id="ct-msg" className={forms.input} rows={6} value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder={topic === TOPICS[1] ? "Which pack, and what happened? A photo helps; we'll ask for one in our reply." : ""} />
            </div>
            {error && <p className={forms.error} role="alert">{error}</p>}
            <div className={forms.actions}>
              <button type="submit" className={ui.btn} disabled={state === "sending"}>{state === "sending" ? <><Spinner /> Sending</> : "Send message"}</button>
            </div>
          </form>
        )}
        <aside className={styles.aside}>
          <div>
            <h2 className={styles.h}>Email</h2>
            <a href="mailto:hello@makzos.com" className={ui.link}>hello@makzos.com</a>
          </div>
          <div>
            <h2 className={styles.h}>Hours</h2>
            <p>Monday to Saturday, 10 am to 7 pm.</p>
          </div>
          <div>
            <h2 className={styles.h}>Business</h2>
            <p><a href="#wholesale" className={ui.link}>Wholesale, stockists and bulk orders</a></p>
          </div>
          <div>
            <h2 className={styles.h}>Quick answers</h2>
            <p><Link href="/track" className={ui.link}>Track an order</Link></p>
            <p><Link href="/faq" className={ui.link}>Read the FAQ</Link></p>
          </div>
          <div>
            <h2 className={styles.h}>Registered company</h2>
            <p>Solivra Innovations Private Limited</p>
          </div>
        </aside>
      </section>
    </>
  );
}
