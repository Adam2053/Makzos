"use client";

import { useState } from "react";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Updates.module.css";

const CITIES = ["Hyderabad", "Bengaluru", "Somewhere else"];

/** The launch page hid the cities in the dark; here they're simply stated, in launch order (guide p.5). */
export function Updates() {
  const [sent, setSent] = useState<string | null>(null);

  // Not wired to a mailing list yet: connect the submit to the real provider before launch.
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const city = String(new FormData(e.currentTarget).get("city"));
    setSent(city === "Somewhere else" ? "your city" : city);
  };

  return (
    <section id="updates" className={styles.section} aria-labelledby="updates-title">
      <div className={styles.seeds} aria-hidden="true">
        <Makhana variant="ink" style={{ right: "-3%", bottom: "-10%", width: "clamp(120px, 14vw, 220px)", rotate: "-16deg" }} />
        <Makhana variant="fill" style={{ right: "7%", top: "7%", width: "clamp(48px, 5vw, 80px)", rotate: "24deg" }} />
      </div>
      <div className={`${ui.shell} ${styles.grid}`}>
        <h2 id="updates-title" className={`${ui.display} ${styles.title}`}>Hyderabad first.<br />Bengaluru next.</h2>
        <div className={styles.side}>
          <p className={ui.lede}>We&rsquo;re launching city by city. Leave your email and we&rsquo;ll tell you when we deliver to you.</p>
          {sent ? (
            <p className={styles.done} role="status">You&rsquo;re on the list. We&rsquo;ll email you when Makzo&rsquo;s reaches {sent}.</p>
          ) : (
            <form className={styles.form} onSubmit={submit}>
              <label className={styles.field}>
                <span>Email</span>
                <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
              </label>
              <label className={styles.field}>
                <span>Your city</span>
                <select name="city" defaultValue="Hyderabad">
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <button type="submit" className={ui.btnDark}>Get launch updates</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
