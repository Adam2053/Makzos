"use client";

import { useState } from "react";
import { Makhana } from "./Makhana";
import ui from "./ui.module.css";
import styles from "./Community.module.css";

/** Launch order from the guide (p.5). No dates are promised, because none are confirmed. */
const CITIES = [
  { id: "hyderabad", name: "Hyderabad", answer: "Hyderabad is first. You'll hear the day we start delivering." },
  { id: "bengaluru", name: "Bengaluru", answer: "Bengaluru is next, straight after Hyderabad. We'll email you when it's your turn." },
  { id: "elsewhere", name: "Somewhere else", answer: "Not yet. Tell us where you are and we'll count you in for the next city." },
];

/** Replace with the brand's own account before launch. */
const INSTAGRAM = "https://instagram.com/";

/** The last ask: join the list for launch news and new flavours, and say where you are. */
export function Community() {
  const [city, setCity] = useState(CITIES[0]);
  const [sent, setSent] = useState(false);

  // Not wired to a mailing list yet: connect the submit to the real provider before launch.
  const submit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); setSent(true); };

  return (
    <section id="community" className={styles.section} aria-labelledby="community-title">
      <Makhana variant="ink" className={styles.seedA} />
      <Makhana variant="fill" className={styles.seedB} />
      <div className={`${ui.shell} ${styles.inner}`}>
        <h2 id="community-title" className={`${ui.display} ${styles.title}`}>Join the crunch.</h2>
        <p className={styles.lede}>Launch days and new flavours, by email. Where should we find you?</p>
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
            <label className={ui.sr} htmlFor="community-email">Email</label>
            <input id="community-email" type="email" required autoComplete="email" placeholder="you@example.com" />
            {city.id === "elsewhere" && (
              <>
                <label className={ui.sr} htmlFor="community-city">Your city</label>
                <input id="community-city" required placeholder="Your city" autoComplete="address-level2" />
              </>
            )}
            <button type="submit" className={ui.btn}>Count me in</button>
          </form>
        )}
        <p className={styles.social}>Or follow along on <a href={INSTAGRAM} className={ui.link} target="_blank" rel="noreferrer">Instagram</a></p>
      </div>
    </section>
  );
}
