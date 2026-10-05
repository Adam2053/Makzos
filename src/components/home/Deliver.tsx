"use client";

import { useState } from "react";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Deliver.module.css";

/** Launch order from the guide (p.5). No dates are promised, because none are confirmed. */
const CITIES = [
  { id: "hyderabad", name: "Hyderabad", answer: "Hyderabad is first. Leave your email and we'll tell you the day we start delivering." },
  { id: "bengaluru", name: "Bengaluru", answer: "Bengaluru is next, straight after Hyderabad. We'll email you when it's your turn." },
  { id: "elsewhere", name: "Somewhere else", answer: "Not yet. Tell us where you are and we'll count you in for the next city." },
];

export function Deliver() {
  const [city, setCity] = useState(CITIES[0]);
  const [sent, setSent] = useState(false);

  // Not wired to a mailing list yet: connect the submit to the real provider before launch.
  const submit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); setSent(true); };

  return (
    <section id="deliver" className={styles.section} aria-labelledby="deliver-title">
      <Makhana variant="ink" className={styles.seedA} />
      <Makhana variant="fill" className={styles.seedB} />
      <div className={`${ui.shell} ${styles.inner}`}>
        <h2 id="deliver-title" className={`${ui.display} ${styles.title}`}>Do we deliver to you yet?</h2>
        <div className={styles.cities} role="group" aria-label="Your city">
          {CITIES.map((c) => (
            <button key={c.id} type="button" className={styles.city} aria-pressed={c.id === city.id} onClick={() => { setCity(c); setSent(false); }}>
              {c.name}
            </button>
          ))}
        </div>
        <p className={styles.answer} aria-live="polite">{city.answer}</p>
        {sent ? (
          <p className={styles.done} role="status">You&rsquo;re on the list for {city.id === "elsewhere" ? "the next city" : city.name}.</p>
        ) : (
          <form className={styles.form} onSubmit={submit}>
            <label className={ui.sr} htmlFor="deliver-email">Email</label>
            <input id="deliver-email" type="email" required autoComplete="email" placeholder="you@example.com" />
            {city.id === "elsewhere" && (
              <>
                <label className={ui.sr} htmlFor="deliver-city">Your city</label>
                <input id="deliver-city" required placeholder="Your city" autoComplete="address-level2" />
              </>
            )}
            <button type="submit" className={ui.btn}>Tell me</button>
          </form>
        )}
      </div>
    </section>
  );
}
