"use client";

import Image from "next/image";
import { useState } from "react";
import { FLAVOURS, PACK_H, PACK_W } from "@/lib/products";
import { CLIPS } from "@/lib/ugc";
import { Film } from "@/components/home/Film";
import { Makhana } from "@/components/home/Makhana";
import { Spinner } from "@/components/shop/bits";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./creators.module.css";

const STEPS = [
  { title: "Tell us about you", text: "Your handle, where you post and which flavour you'd film first." },
  { title: "Get a box", text: "If it's a fit, we send four packs before they're in stores." },
  { title: "Film your moment", text: "Open it, eat it, say what you really think. Tag @makzos." },
  { title: "Get featured", text: "The best videos go on the flavour's page and our Instagram, with your name on them." },
];

const PLATFORMS = ["Instagram", "YouTube", "Moj", "Josh", "Other"];
const SIZES = ["Under 1,000", "1,000 to 10,000", "10,000 to 50,000", "50,000 to 2 lakh", "Over 2 lakh"];

type Form = { name: string; email: string; handle: string; platform: string; size: string; city: string; flavour: string; link: string; agree: boolean };

/** The creator programme: what happens, then the form. Applying is UI only for now. */
export function CreatorsView() {
  const [f, setF] = useState<Form>({ name: "", email: "", handle: "", platform: "Instagram", size: "", city: "", flavour: "", link: "", agree: false });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (f.name.trim().length < 2) err.name = "Add your name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) err.email = "Add an email we can reply to.";
    if (!/^@?[\w.]{2,30}$/.test(f.handle.trim())) err.handle = "Add your handle, like @yourname.";
    if (!f.size) err.size = "Pick the closest follower count.";
    if (!f.flavour) err.flavour = "Pick the flavour you'd film first.";
    if (!f.agree) err.agree = "Tick this so we can share your video if we feature it.";
    setErrors(err);
    if (Object.keys(err).length) return;
    setState("sending");
    window.setTimeout(() => setState("sent"), 1000);
  };

  return (
    <>
      <section className={styles.hero}>
        <div className={`${ui.shell} ${styles.heroInner}`}>
          <div>
            <h1 className={`${ui.display} ${styles.title}`}>Film the crunch.</h1>
            <p className={`${ui.lede} ${styles.lede}`}>We&rsquo;re looking for people who make honest food videos. Get packs early, film what you think, and see your video on our pages.</p>
            <a href="#apply" className={ui.btnPaprika}>Join the creator list</a>
          </div>
          <ul className={styles.reel} aria-label="Sample creator videos">
            {CLIPS.slice(0, 3).map((c, i) => (
              <li key={c.id} className={styles.tile} data-i={i}>
                <Film clip={c} label={`Sample creator video ${i + 1}`} />
                {c.sample && <span className={styles.tag}>Sample video</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${ui.shell} ${styles.how}`} aria-labelledby="how-title">
        <h2 id="how-title" className={`${ui.display} ${styles.h2}`}>How it works.</h2>
        <ol className={styles.steps}>
          {STEPS.map((s) => <li key={s.title}><strong className={ui.display}>{s.title}</strong><span>{s.text}</span></li>)}
        </ol>
      </section>

      <section id="apply" className={styles.apply} aria-labelledby="apply-title">
        <div className={`${ui.shell} ${styles.applyGrid}`}>
          <div>
            <h2 id="apply-title" className={`${ui.display} ${styles.h2}`}>Join the list.</h2>
            <p className={`${ui.lede} ${styles.quiet}`}>Any size of following. We care more that you like food than how many people watch.</p>
            <ul className={styles.packs} aria-hidden="true">
              {FLAVOURS.slice(0, 4).map((x) => <li key={x.id}><Image src={x.pack} alt="" width={PACK_W} height={PACK_H} sizes="90px" /></li>)}
            </ul>
          </div>

          {state === "sent" ? (
            <div className={styles.sent} role="status">
              <Makhana variant="fill" className={styles.sentSeed} />
              <p className={ui.display}>You&rsquo;re on the list, {f.name.split(" ")[0]}.</p>
              <span>We&rsquo;ll write to {f.email} when the next boxes go out. Keep an eye on {f.handle.startsWith("@") ? f.handle : `@${f.handle}`}&rsquo;s DMs too.</span>
            </div>
          ) : (
            <form className={`${forms.form} ${styles.form}`} onSubmit={submit} noValidate>
              <div className={forms.row}>
                <Field label="Your name" error={errors.name}><input id="cr-name" className={forms.input} autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} aria-invalid={errors.name ? true : undefined} /></Field>
                <Field label="Email" error={errors.email}><input id="cr-email" className={forms.input} type="email" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} aria-invalid={errors.email ? true : undefined} /></Field>
              </div>
              <div className={forms.field}>
                <span className={forms.label} id="cr-platform">Where you post most</span>
                <div className={forms.segments} role="group" aria-labelledby="cr-platform">
                  {PLATFORMS.map((p) => <button key={p} type="button" className={forms.segment} aria-pressed={f.platform === p} onClick={() => set("platform", p)}>{p}</button>)}
                </div>
              </div>
              <div className={forms.row}>
                <Field label="Your handle" error={errors.handle}><input id="cr-handle" className={forms.input} placeholder="@yourname" value={f.handle} onChange={(e) => set("handle", e.target.value)} aria-invalid={errors.handle ? true : undefined} /></Field>
                <Field label="Followers" error={errors.size}>
                  <select id="cr-size" className={forms.input} value={f.size} onChange={(e) => set("size", e.target.value)} aria-invalid={errors.size ? true : undefined}>
                    <option value="">Choose</option>
                    {SIZES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <div className={forms.row}>
                <Field label="City" optional><input id="cr-city" className={forms.input} autoComplete="address-level2" value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
                <Field label="First flavour you'd film" error={errors.flavour}>
                  <select id="cr-flavour" className={forms.input} value={f.flavour} onChange={(e) => set("flavour", e.target.value)} aria-invalid={errors.flavour ? true : undefined}>
                    <option value="">Choose</option>
                    {FLAVOURS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="A food video you're proud of" optional><input id="cr-link" className={forms.input} type="url" placeholder="https://" value={f.link} onChange={(e) => set("link", e.target.value)} /></Field>
              <div className={forms.field}>
                <label className={forms.check}>
                  <input type="checkbox" checked={f.agree} onChange={(e) => set("agree", e.target.checked)} />
                  If you feature my video, you can show it on makzos.com and Instagram with my handle.
                </label>
                {errors.agree && <p className={forms.error}>{errors.agree}</p>}
              </div>
              <div className={forms.actions}>
                <button type="submit" className={ui.btn} disabled={state === "sending"}>{state === "sending" ? <><Spinner /> Sending</> : "Join the creator list"}</button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

/** Label, control, error: the control passed in carries its own id, read from it here. */
function Field({ label, error, optional, children }: { label: string; error?: string; optional?: boolean; children: React.ReactElement<{ id: string }> }) {
  const id = children.props.id;
  return (
    <div className={forms.field}>
      <label className={forms.label} htmlFor={id}>{label}{optional && <small> (optional)</small>}</label>
      {children}
      {error && <p className={forms.error}>{error}</p>}
    </div>
  );
}
