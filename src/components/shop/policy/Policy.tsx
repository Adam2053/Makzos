import type { Metadata } from "next";
import Link from "next/link";
import { inr } from "@/lib/products";
import { DELIVERY, FREE_FROM } from "@/lib/pricing";
import { PageHead, SampleTag } from "../bits";
import ui from "@/components/home/ui.module.css";
import styles from "./policy.module.css";

export type PolicySlug = "shipping" | "returns" | "privacy" | "terms";

/**
 * DRAFTS. These say how the shop is built to work, so the pages and links exist. Each one
 * needs legal review, and the real company details, before launch; the tag says so on the page.
 */
const POLICIES: Record<PolicySlug, { title: string; lede: string; sections: { h: string; p: string[] }[] }> = {
  shipping: {
    title: "Delivery.",
    lede: "Where we deliver, how long it takes and what it costs.",
    sections: [
      { h: "Where", p: ["Hyderabad first, then Bengaluru. Check your pincode on any flavour's page. Elsewhere, find us on Amazon for now."] },
      { h: "How long", p: [`${DELIVERY.standard.label}: ${DELIVERY.standard.eta}. ${DELIVERY.express.label}: ${DELIVERY.express.eta}, for orders placed before 2 pm.`] },
      { h: "What it costs", p: [`${DELIVERY.standard.label} delivery is ${inr(DELIVERY.standard.fee)}, and free on orders over ${inr(FREE_FROM)}. ${DELIVERY.express.label} is ${inr(DELIVERY.express.fee)}.`] },
      { h: "Tracking", p: ["Every order has its own page that updates as it moves. We also text you when it ships and when it's out for delivery."] },
    ],
  },
  returns: {
    title: "Returns and refunds.",
    lede: "Food can't come back once it's left us, but a damaged or wrong pack always gets put right.",
    sections: [
      { h: "Damaged, missing or wrong", p: ["Tell us within 48 hours of delivery, with a photo, and we'll send a replacement or refund it. You don't need to send anything back."] },
      { h: "Cancelling", p: ["You can cancel from the order's page until it's packed and shipped."] },
      { h: "Refunds", p: ["Refunds go back the way you paid, within 5 to 7 working days. Cash on delivery refunds go to a UPI ID or bank account you give us."] },
    ],
  },
  privacy: {
    title: "Privacy.",
    lede: "What we collect, why, and what you can ask us to do with it.",
    sections: [
      { h: "What we keep", p: ["Your name, phone number, email if you give it, delivery addresses and orders. Payments are handled by our payment provider; we never see or store full card numbers."] },
      { h: "Why", p: ["To deliver your orders, send updates about them, and, only if you say yes, tell you about new flavours."] },
      { h: "Your choices", p: ["Change your details in your account, or write to hello@makzos.com to download or delete everything we hold about you."] },
    ],
  },
  terms: {
    title: "Terms.",
    lede: "The short version of how buying from makzos.com works.",
    sections: [
      { h: "Prices", p: ["Prices include taxes. Delivery is shown before you pay. Codes can't be combined and can be withdrawn."] },
      { h: "Orders", p: ["An order is confirmed when payment succeeds, or when it's placed for cash on delivery. If we can't fulfil it, we'll tell you and refund it in full."] },
      { h: "Allergens", p: ["Milk, groundnut and soya are present across the range. Always read the pack before eating."] },
    ],
  },
};

export const policyMetadata = (slug: PolicySlug): Metadata => ({ title: `${POLICIES[slug].title.replace(".", "")} — Makzo's` });

/** One template, four routes (sitemap: Policy & utility). */
export function Policy({ slug }: { slug: PolicySlug }) {
  const p = POLICIES[slug];
  return (
    <>
      <PageHead title={p.title} lede={p.lede} crumbs={[{ href: "/", label: "Home" }, { label: p.title.replace(".", "") }]}>
        <div className={styles.draft}><SampleTag>Draft, pending legal review</SampleTag></div>
      </PageHead>
      <section className={`${ui.shell} ${styles.body}`}>
        <nav aria-label="Policies" className={styles.nav}>
          {Object.entries(POLICIES).map(([k, v]) => <Link key={k} href={`/${k}`} aria-current={k === slug ? "page" : undefined}>{v.title.replace(".", "")}</Link>)}
        </nav>
        <div className={styles.text}>
          {p.sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((t) => <p key={t}>{t}</p>)}
            </section>
          ))}
          <p className={styles.ask}>Questions? <Link href="/contact" className={ui.link}>Write to us</Link></p>
        </div>
      </section>
    </>
  );
}
