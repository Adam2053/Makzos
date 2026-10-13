"use client";

import { useState } from "react";
import { PageHead, Spinner } from "@/components/shop/bits";
import { Makhana } from "@/components/home/Makhana";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./careers.module.css";

const TEAMS = ["Sales and distribution", "Marketing and content", "Operations", "Food and product", "Something else"];

/** No roles are listed, so the page says so and takes a general application. Add roles as they open. */
export function CareersView() {
  const [team, setTeam] = useState(TEAMS[0]);
  const [f, setF] = useState({ name: "", email: "", link: "", note: "" });
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.name.trim().length < 2) return setError("Add your name.");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setError("Add an email we can reply to.");
    if (!/^https?:\/\/\S+$/.test(f.link)) return setError("Add a link to your CV or LinkedIn, starting with https://");
    setError(null);
    setState("sending");
    window.setTimeout(() => setState("sent"), 900);
  };

  return (
    <>
      <PageHead title="Work with us." lede="We're a small team making snacks out of dishes people love. There are no open roles right now, but we read every note." crumbs={[{ href: "/", label: "Home" }, { label: "Careers" }]} />
      <section className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.roles}>
          <h2 className={styles.h}>Open roles</h2>
          <div className={styles.empty}>
            <Makhana variant="outline" className={styles.seed} />
            <p>Nothing open today. Send a note and we&rsquo;ll write when something fits.</p>
          </div>
        </div>
        {state === "sent" ? (
          <div className={styles.sent} role="status">
            <Makhana variant="fill" className={styles.seed} />
            <p className={ui.display}>Thanks, {f.name.split(" ")[0]}.</p>
            <span>We&rsquo;ve got your note. If a role in {team.toLowerCase()} opens, you&rsquo;ll hear from us first.</span>
          </div>
        ) : (
          <form className={`${forms.form} ${styles.form}`} onSubmit={submit} noValidate>
            <h2 className={`${ui.display} ${styles.formTitle}`}>Send a note.</h2>
            <div className={forms.field}>
              <span className={forms.label} id="team">The team you&rsquo;d join</span>
              <div className={forms.segments} role="group" aria-labelledby="team">
                {TEAMS.map((t) => <button key={t} type="button" className={forms.segment} aria-pressed={team === t} onClick={() => setTeam(t)}>{t}</button>)}
              </div>
            </div>
            <div className={forms.row}>
              <div className={forms.field}><label className={forms.label} htmlFor="c-n">Name</label><input id="c-n" className={forms.input} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
              <div className={forms.field}><label className={forms.label} htmlFor="c-e">Email</label><input id="c-e" className={forms.input} type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            </div>
            <div className={forms.field}><label className={forms.label} htmlFor="c-l">CV or LinkedIn link</label><input id="c-l" className={forms.input} type="url" placeholder="https://" value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} /></div>
            <div className={forms.field}><label className={forms.label} htmlFor="c-t">Why Makzo&rsquo;s? <small>(optional)</small></label><textarea id="c-t" className={forms.input} rows={4} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
            {error && <p className={forms.error} role="alert">{error}</p>}
            <div className={forms.actions}><button type="submit" className={ui.btn} disabled={state === "sending"}>{state === "sending" ? <><Spinner /> Sending</> : "Send note"}</button></div>
          </form>
        )}
      </section>
    </>
  );
}
