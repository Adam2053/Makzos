"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { Spinner } from "@/components/shop/bits";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";

/**
 * The way into Shopify's checkout: the bag becomes a Shopify cart (signed in, when the shopper
 * is), and the browser goes to Shopify for address, delivery, UPI, cards, net banking or cash on
 * delivery. Shopify places the order; coming back, the bag empties itself.
 */
export function HandOff() {
  const { lines, ready, checkout } = useCart();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const go = () => {
    setError(null);
    checkout().then((message) => message && setError(message));
  };

  useEffect(() => {
    if (!ready || started.current || lines.length === 0) return;
    started.current = true;
    go();
  }, [ready, lines.length]); // eslint-disable-line react-hooks/exhaustive-deps -- once, as soon as the bag is known.

  const box: React.CSSProperties = { display: "grid", gap: 16, justifyItems: "start", paddingBlock: "96px", maxWidth: 560 };

  if (ready && lines.length === 0) {
    return (
      <section className={ui.shell} style={box}>
        <h1 className={ui.display}>Your bag is empty.</h1>
        <Link href="/shop" className={ui.btnPaprika}>Shop the flavours</Link>
      </section>
    );
  }

  return (
    <section className={ui.shell} style={box} aria-live="polite">
      {error ? (
        <>
          <h1 className={ui.display}>Checkout didn&rsquo;t open.</h1>
          <p className={forms.error} role="alert">{error}</p>
          <div className={forms.actions}>
            <button type="button" className={ui.btn} onClick={go}>Try again</button>
            <Link href="/cart" className={ui.link}>Back to bag</Link>
          </div>
        </>
      ) : (
        <p className={ui.lede}><Spinner /> Taking you to secure checkout&hellip;</p>
      )}
    </section>
  );
}
