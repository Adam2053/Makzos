"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { inr } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { DELIVERY, totals, type DeliveryId } from "@/lib/pricing";
import { addressLines, fmtPhone, useStore, type Address, type PaymentMethod } from "@/lib/store";
import { Makhana } from "@/components/home/Makhana";
import { AddressForm, blankAddress } from "@/components/shop/AddressForm";
import { SignIn } from "@/components/shop/SignIn";
import { CouponField, LineList, TotalsTable } from "@/components/shop/Summary";
import { Spinner } from "@/components/shop/bits";
import ui from "@/components/home/ui.module.css";
import forms from "@/components/shop/forms.module.css";
import styles from "./checkout.module.css";

type StepId = "contact" | "address" | "delivery" | "payment";
const ORDER: StepId[] = ["contact", "address", "delivery", "payment"];
const TITLES: Record<StepId, string> = { contact: "Contact", address: "Delivery address", delivery: "Delivery speed", payment: "Payment" };
/** What a finished step is called in the review rows and the trail. */
const SHORT: Record<StepId, string> = { contact: "Contact", address: "Ship to", delivery: "Method", payment: "Payment" };
const TRAIL: Record<StepId, string> = { contact: "Contact", address: "Address", delivery: "Delivery", payment: "Payment" };

const UPI_APPS = ["Google Pay", "PhonePe", "Paytm", "BHIM"];
const CARD_MARKS = ["Visa", "Mastercard", "RuPay"];
const BANKS = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank", "Other bank"];
/** Cash on delivery stops here; above it, pay online. A placeholder rule, like the prices. */
const COD_LIMIT = 1000;

/** Demo inputs that fail, so the error states can be seen. */
const DECLINED_CARD = "4000000000000002";
const DECLINED_UPI = "fail@upi";

type Contact = { name: string; phone: string; email: string };
type Pay = { method: PaymentMethod; app: string; upiId: string; card: { number: string; expiry: string; cvc: string; name: string }; bank: string };

const cardDigits = (s: string) => s.replace(/\D/g, "");
const fmtCard = (s: string) => cardDigits(s).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
const fmtExpiry = (s: string) => { const d = s.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

function payErrors(p: Pay, total: number): Record<string, string> {
  const e: Record<string, string> = {};
  if (p.method === "upi" && !p.app && !/^[\w.-]{2,}@[a-z]{2,}$/i.test(p.upiId.trim())) e.upi = "Pick your UPI app, or enter a UPI ID like name@okbank.";
  if (p.method === "card") {
    if (cardDigits(p.card.number).length < 15) e.number = "Card numbers are 15 or 16 digits.";
    const [mm, yy] = p.card.expiry.split("/").map(Number);
    const now = new Date();
    if (!mm || !yy || mm > 12 || 2000 + yy < now.getFullYear() || (2000 + yy === now.getFullYear() && mm < now.getMonth() + 1)) e.expiry = "Enter a future expiry date as MM/YY.";
    if (!/^\d{3,4}$/.test(p.card.cvc)) e.cvc = "The 3 digits on the back.";
    if (p.card.name.trim().length < 2) e.cardName = "The name as printed on the card.";
  }
  if (p.method === "netbanking" && !p.bank) e.bank = "Choose your bank.";
  if (p.method === "cod" && total > COD_LIMIT) e.cod = `Cash on delivery is for orders up to ${inr(COD_LIMIT)}.`;
  return e;
}

function payLabel(p: Pay) {
  if (p.method === "upi") return p.app ? `UPI, ${p.app}` : `UPI, ${p.upiId.trim()}`;
  if (p.method === "card") return `Card ending ${cardDigits(p.card.number).slice(-4)}`;
  if (p.method === "netbanking") return `Net banking, ${p.bank}`;
  return "Cash on delivery";
}

/**
 * One page, four steps, opened one at a time. A finished step folds down to a line saying
 * what was chosen, with Change beside it. The summary stays in view the whole way. Placing
 * the order waits on a pretend payment, then lands on the order's own page.
 */
export function CheckoutView() {
  const router = useRouter();
  const cart = useCart();
  const store = useStore();
  const { user, addresses, ready } = store;

  const [openStep, setStep] = useState<StepId>("contact");
  const [finished, setDone] = useState<Set<StepId>>(new Set());
  const [mode, setMode] = useState<"signin" | "guest">("signin");
  const [guest, setContact] = useState<Contact>({ name: "", phone: "", email: "" });
  const [contactErr, setContactErr] = useState<Partial<Contact>>({});
  const [pickedId, setAddressId] = useState<string | null>(null);
  const [guestAddress, setGuestAddress] = useState<Address | null>(null);
  const [addingNew, setAdding] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [pay, setPay] = useState<Pay>({ method: "upi", app: "", upiId: "", card: { number: "", expiry: "", cvc: "", name: "" }, bank: "" });
  const [payErr, setPayErr] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState<"idle" | "waiting" | "failed" | "placed">("idle");
  const [failure, setFailure] = useState("");
  const top = useRef<HTMLDivElement>(null);

  /*
   * Signed in, now or on arrival, the contact step is answered by the account: its details
   * are used, the step counts as done, and checkout opens on the address. The default
   * address is picked until another is chosen; with none saved, the form opens.
   */
  const contact: Contact = user ? { name: user.name, phone: user.phone, email: user.email ?? "" } : guest;
  const done = user ? new Set(finished).add("contact") : finished;
  const step: StepId = user && openStep === "contact" ? "address" : openStep;
  const addressId = pickedId ?? (addresses.find((a) => a.isDefault) ?? addresses[0])?.id ?? null;
  const adding = addingNew || addresses.length === 0;

  const t = totals(cart.subtotal, cart.coupon, delivery);
  const address = user ? addresses.find((a) => a.id === addressId) ?? null : guestAddress;

  const finish = (s: StepId) => {
    setDone((d) => new Set(d).add(s));
    const next = ORDER[ORDER.indexOf(s) + 1];
    if (next) setStep(next);
  };

  const saveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Partial<Contact> = {};
    if (guest.name.trim().length < 2) err.name = "Add your name.";
    if (!/^[6-9]\d{9}$/.test(guest.phone)) err.phone = "Enter a 10-digit mobile number. We text order updates to it.";
    if (guest.email && !/^\S+@\S+\.\S+$/.test(guest.email)) err.email = "That email doesn't look right.";
    setContactErr(err);
    if (Object.keys(err).length) return;
    finish("contact");
  };

  const place = () => {
    const e = payErrors(pay, t.total);
    setPayErr(e);
    if (Object.keys(e).length || !address) return;
    setPlacing("waiting");
    setFailure("");
    window.setTimeout(() => {
      const declined = (pay.method === "card" && cardDigits(pay.card.number) === DECLINED_CARD) || (pay.method === "upi" && pay.upiId.trim().toLowerCase() === DECLINED_UPI);
      if (declined) {
        setPlacing("failed");
        setFailure(pay.method === "card"
          ? "Your bank declined the payment. Nothing was charged. Try another card, or pay by UPI."
          : "The UPI request wasn't approved in time. Nothing was charged. Try again, or choose another way to pay.");
        return;
      }
      const order = store.placeOrder({
        lines: cart.lines, saving: cart.saving, totals: t, coupon: cart.coupon?.code, delivery, address,
        contact: { name: contact.name, phone: contact.phone, email: contact.email || undefined },
        payment: { method: pay.method, label: payLabel(pay) },
      });
      setPlacing("placed");
      cart.clear();
      router.replace(`/orders/${order.id}?placed=1`);
    }, pay.method === "cod" ? 900 : 2200);
  };

  if (!cart.ready || !ready || placing === "placed") {
    return <div className={`${ui.shell} ${styles.loading}`}><Spinner /> {placing === "placed" ? "Order placed. Opening it…" : "Loading checkout"}</div>;
  }

  if (cart.lines.length === 0) {
    return (
      <section className={`${ui.shell} ${styles.empty}`}>
        <Makhana variant="outline" className={styles.emptySeed} />
        <h1 className={styles.emptyTitle}>Nothing to check out</h1>
        <p className={styles.muted}>Your bag is empty. Add a flavour or two, then come back.</p>
        <Link href="/shop" className={styles.primary}>Shop the flavours</Link>
      </section>
    );
  }

  const summaries: Record<StepId, React.ReactNode> = {
    contact: <>{contact.name}, {fmtPhone(contact.phone)}{contact.email && <span className={styles.muted}> · {contact.email}</span>}</>,
    address: address && <>{addressLines(address).join(", ")}</>,
    delivery: <>{DELIVERY[delivery].label}, {DELIVERY[delivery].eta} <span className={styles.muted}>· {t.delivery === 0 ? "Free" : inr(t.delivery)}</span></>,
    payment: null,
  };

  /**
   * A step in the column. Finished: a single review row (what, the answer, Change). Open: its
   * title and form. Not reached: its title, greyed. Hairlines between them, no boxes.
   */
  const frame = (id: StepId, body: React.ReactNode) => {
    const isOpen = step === id;
    const isDone = done.has(id) && !isOpen;
    const canChange = isDone && !(id === "contact" && user);
    if (isDone) {
      return (
        <section className={styles.row} aria-label={TITLES[id]}>
          <span className={styles.rowLabel}>{SHORT[id]}</span>
          <span className={styles.rowValue}>{summaries[id]}</span>
          {canChange && <button type="button" className={styles.change} onClick={() => setStep(id)} aria-label={`Change ${TITLES[id].toLowerCase()}`}>Change</button>}
        </section>
      );
    }
    return (
      <section className={styles.step} data-open={isOpen || undefined} aria-labelledby={`step-${id}`}>
        <h2 id={`step-${id}`} className={styles.stepTitle}>{TITLES[id]}</h2>
        {isOpen && <div className={styles.stepBody}>{body}</div>}
      </section>
    );
  };

  const summary = (
    <>
      <LineList lines={cart.lines} compact />
      <div className={styles.code}><CouponField /></div>
      <TotalsTable saving={cart.saving} totals={t} coupon={cart.coupon?.code} method={done.has("delivery") || step === "payment" ? delivery : undefined} />
    </>
  );

  return (
    <div className={styles.page}>
      <div ref={top} className={styles.flow}>
        {/* Where you are: the bag, then the four steps. Finished ones can be reopened. */}
        <nav aria-label="Checkout steps" className={styles.trail}>
          <ol>
            <li><Link href="/cart">Bag</Link></li>
            {ORDER.map((id) => (
              <li key={id} data-state={step === id ? "now" : done.has(id) ? "done" : "next"} aria-current={step === id ? "step" : undefined}>
                {done.has(id) && step !== id && !(id === "contact" && user)
                  ? <button type="button" onClick={() => setStep(id)}>{TRAIL[id]}</button>
                  : <span>{TRAIL[id]}</span>}
              </li>
            ))}
          </ol>
        </nav>

        {/* Phones: the summary folds up above the steps. */}
        <details className={styles.mobileSummary}>
          <summary><span>Order summary</span><strong>{inr(t.total)}</strong></summary>
          <div className={styles.mobileSummaryBody}>{summary}</div>
        </details>

        <div className={styles.steps}>
          {frame("contact",
            <>
              <div className={styles.toggle} role="tablist" aria-label="How to check out">
                <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => setMode("signin")}>Sign in with phone</button>
                <button type="button" role="tab" aria-selected={mode === "guest"} onClick={() => setMode("guest")}>Guest checkout</button>
              </div>
              {mode === "signin" ? (
                <div className={styles.signin}>
                  <p className={styles.muted}>Saves your address and orders. New numbers get an account in the same steps.</p>
                  <SignIn onDone={() => { /* Signed in: `user` now answers this step. */ }} compact buttonClass={styles.primary} />
                </div>
              ) : (
                <form className={forms.form} onSubmit={saveGuest} noValidate>
                  <div className={forms.row}>
                    <div className={forms.field}>
                      <label className={forms.label} htmlFor="c-name">Full name</label>
                      <input id="c-name" className={forms.input} autoComplete="name" value={guest.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} aria-invalid={contactErr.name ? true : undefined} />
                      {contactErr.name && <p className={forms.error}>{contactErr.name}</p>}
                    </div>
                    <div className={forms.field}>
                      <label className={forms.label} htmlFor="c-phone">Mobile number</label>
                      <input id="c-phone" className={forms.input} type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" value={guest.phone}
                        onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value.replace(/\D/g, "") }))} aria-invalid={contactErr.phone ? true : undefined} />
                      {contactErr.phone && <p className={forms.error}>{contactErr.phone}</p>}
                    </div>
                  </div>
                  <div className={forms.field}>
                    <label className={forms.label} htmlFor="c-email">Email <small>(optional, for the receipt)</small></label>
                    <input id="c-email" className={forms.input} type="email" autoComplete="email" value={guest.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} aria-invalid={contactErr.email ? true : undefined} />
                    {contactErr.email && <p className={forms.error}>{contactErr.email}</p>}
                  </div>
                  <button type="submit" className={styles.primary}>Continue to address</button>
                </form>
              )}
            </>,
          )}

          {frame("address",
            user ? (
              adding || addresses.length === 0 ? (
                <AddressForm initial={blankAddress(user.name, user.phone)} requireService submitLabel="Save and continue" submitClass={styles.primary}
                  onCancel={addresses.length ? () => setAdding(false) : undefined}
                  onSave={(a) => { const saved = store.saveAddress(a); setAddressId(saved.id); setAdding(false); finish("address"); }} />
              ) : (
                <div className={styles.stack}>
                  <div className={styles.group} role="radiogroup" aria-label="Saved addresses">
                    {addresses.map((a) => (
                      <label key={a.id} className={styles.option}>
                        <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
                        <span className={styles.optionBody}>
                          <span className={styles.optionTitle}>{a.label}{a.isDefault && <span className={styles.tag}>Default</span>}</span>
                          <span className={styles.muted}>{a.name}, {fmtPhone(a.phone)}</span>
                          <span className={styles.muted}>{addressLines(a).join(", ")}</span>
                        </span>
                      </label>
                    ))}
                    <button type="button" className={styles.addRow} onClick={() => setAdding(true)}><span aria-hidden="true">+</span> Use a new address</button>
                  </div>
                  <button type="button" className={styles.primary} disabled={!addressId} onClick={() => finish("address")}>Deliver here</button>
                </div>
              )
            ) : (
              <AddressForm initial={guestAddress ?? blankAddress(contact.name, contact.phone)} requireService showDefault={false} submitLabel="Continue to delivery" submitClass={styles.primary}
                onSave={(a) => { setGuestAddress({ ...a, id: "guest" }); finish("address"); }} />
            ),
          )}

          {frame("delivery",
            <div className={styles.stack}>
              <div className={styles.group} role="radiogroup" aria-label="Delivery speed">
                {(Object.keys(DELIVERY) as DeliveryId[]).map((id) => {
                  const fee = totals(cart.subtotal, cart.coupon, id).delivery;
                  return (
                    <label key={id} className={styles.option}>
                      <input type="radio" name="delivery" checked={delivery === id} onChange={() => setDelivery(id)} />
                      <span className={styles.optionBody}>
                        <span className={styles.optionTitle}>{DELIVERY[id].label}</span>
                        <span className={styles.muted}>{DELIVERY[id].eta}</span>
                      </span>
                      <span className={styles.optionSide}>{fee === 0 ? "Free" : inr(fee)}</span>
                    </label>
                  );
                })}
              </div>
              <button type="button" className={styles.primary} onClick={() => finish("delivery")}>Continue to payment</button>
            </div>,
          )}

          {frame("payment",
            <div className={styles.stack}>
              <p className={styles.muted}>Every payment is encrypted. We never see or store your card number.</p>
              <div className={styles.group} role="radiogroup" aria-label="Payment method">
                {([
                  ["upi", "UPI", UPI_APPS.slice(0, 3).join(", ") + " or any UPI ID", ["UPI"]],
                  ["card", "Debit or credit card", null, CARD_MARKS],
                  ["netbanking", "Net banking", "All major banks", []],
                  ["cod", "Cash on delivery", `Orders up to ${inr(COD_LIMIT)}`, []],
                ] as [PaymentMethod, string, string | null, string[]][]).map(([id, label, note, marks]) => (
                  <div key={id} className={styles.payRow} data-on={pay.method === id || undefined}>
                    <label className={styles.option}>
                      <input type="radio" name="pay" checked={pay.method === id} onChange={() => { setPay((p) => ({ ...p, method: id })); setPayErr({}); }} />
                      <span className={styles.optionBody}>
                        <span className={styles.optionTitle}>{label}</span>
                        {note && <span className={styles.muted}>{note}</span>}
                      </span>
                      {marks.length > 0 && <span className={styles.marks} aria-hidden="true">{marks.map((m) => <span key={m}>{m}</span>)}</span>}
                    </label>

                    {pay.method === id && id === "upi" && (
                      <div className={styles.payBody}>
                        <div className={styles.apps} role="group" aria-label="UPI app">
                          {UPI_APPS.map((a) => (
                            <button key={a} type="button" className={styles.app} aria-pressed={pay.app === a} onClick={() => { setPay((p) => ({ ...p, app: p.app === a ? "" : a, upiId: "" })); setPayErr({}); }}>
                              <span className={styles.appMark} aria-hidden="true">{a.charAt(0)}</span>{a}
                            </button>
                          ))}
                        </div>
                        <div className={styles.or}><span>or pay to a UPI ID</span></div>
                        <div className={forms.field}>
                          <label className={ui.sr} htmlFor="upi-id">UPI ID</label>
                          <input id="upi-id" className={forms.input} placeholder="name@okbank" autoComplete="off" value={pay.upiId}
                            onChange={(e) => { setPay((p) => ({ ...p, upiId: e.target.value, app: "" })); setPayErr({}); }} aria-invalid={payErr.upi ? true : undefined} />
                          {payErr.upi ? <p className={forms.error}>{payErr.upi}</p> : <p className={styles.hint}>Demo: {DECLINED_UPI} is declined.</p>}
                        </div>
                      </div>
                    )}

                    {pay.method === id && id === "card" && (
                      <div className={styles.payBody}>
                        <div className={styles.card}>
                          <label className={ui.sr} htmlFor="cc-num">Card number</label>
                          <input id="cc-num" className={styles.cardNum} inputMode="numeric" autoComplete="cc-number" placeholder="Card number" value={pay.card.number}
                            onChange={(e) => setPay((p) => ({ ...p, card: { ...p.card, number: fmtCard(e.target.value) } }))} aria-invalid={payErr.number ? true : undefined} />
                          <div className={styles.cardSplit}>
                            <label className={ui.sr} htmlFor="cc-exp">Expiry</label>
                            <input id="cc-exp" inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" value={pay.card.expiry}
                              onChange={(e) => setPay((p) => ({ ...p, card: { ...p.card, expiry: fmtExpiry(e.target.value) } }))} aria-invalid={payErr.expiry ? true : undefined} />
                            <label className={ui.sr} htmlFor="cc-cvc">CVV</label>
                            <input id="cc-cvc" inputMode="numeric" autoComplete="cc-csc" maxLength={4} placeholder="CVV" value={pay.card.cvc}
                              onChange={(e) => setPay((p) => ({ ...p, card: { ...p.card, cvc: e.target.value.replace(/\D/g, "") } }))} aria-invalid={payErr.cvc ? true : undefined} />
                          </div>
                        </div>
                        <label className={ui.sr} htmlFor="cc-name">Name on card</label>
                        <input id="cc-name" className={forms.input} autoComplete="cc-name" placeholder="Name on card" value={pay.card.name}
                          onChange={(e) => setPay((p) => ({ ...p, card: { ...p.card, name: e.target.value } }))} aria-invalid={payErr.cardName ? true : undefined} />
                        {[payErr.number, payErr.expiry, payErr.cvc, payErr.cardName].filter(Boolean).map((m) => <p key={m} className={forms.error}>{m}</p>)}
                        {!Object.keys(payErr).length && <p className={styles.hint}>Demo: 4000 0000 0000 0002 is declined; any other number goes through.</p>}
                      </div>
                    )}

                    {pay.method === id && id === "netbanking" && (
                      <div className={styles.payBody}>
                        <label className={ui.sr} htmlFor="bank">Your bank</label>
                        <select id="bank" className={forms.input} value={pay.bank} onChange={(e) => { setPay((p) => ({ ...p, bank: e.target.value })); setPayErr({}); }} aria-invalid={payErr.bank ? true : undefined}>
                          <option value="">Choose your bank</option>
                          {BANKS.map((b) => <option key={b}>{b}</option>)}
                        </select>
                        {payErr.bank ? <p className={forms.error}>{payErr.bank}</p> : <p className={styles.hint}>You&rsquo;ll approve the payment on your bank&rsquo;s page.</p>}
                      </div>
                    )}

                    {pay.method === id && id === "cod" && (
                      <div className={styles.payBody}>
                        {payErr.cod ? <p className={forms.error}>{payErr.cod}</p> : <p className={styles.hint}>Keep {inr(t.total)} ready, in cash or by UPI to the courier.</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {placing === "failed" && (
                <div className={styles.failed} role="alert">
                  <strong>Payment didn&rsquo;t go through</strong>
                  <span>{failure}</span>
                </div>
              )}

              <button type="button" className={`${styles.primary} ${styles.pay}`} onClick={place} disabled={placing === "waiting"}>
                {placing === "waiting" ? <><Spinner /> {pay.method === "cod" ? "Placing order" : "Waiting for payment"}</> : (
                  <><Lock /> {pay.method === "cod" ? `Place order · ${inr(t.total)}` : `Pay ${inr(t.total)}`}</>
                )}
              </button>
              <p className={styles.terms}>By placing this order you agree to our <Link href="/terms">terms</Link> and <Link href="/returns">returns policy</Link>.</p>
            </div>,
          )}
        </div>
      </div>

      <aside className={styles.side} aria-label="Order summary">
        <div className={styles.sideInner}>
          <h2 className={styles.sideTitle}>Order summary <Link href="/cart" className={styles.edit}>Edit</Link></h2>
          {summary}
        </div>
      </aside>

      {/* While a payment is pending, the page waits with you. */}
      {placing === "waiting" && (
        <div className={styles.waiting} role="status" aria-live="assertive">
          <div className={styles.waitingCard}>
            <span className={styles.ring} aria-hidden="true" />
            <p className={styles.waitingTitle}>
              {pay.method === "upi" ? `Approve ${inr(t.total)} in ${pay.app || "your UPI app"}` : pay.method === "card" ? "Confirming with your bank" : pay.method === "netbanking" ? `Opening ${pay.bank}` : "Placing your order"}
            </p>
            <span className={styles.muted}>Keep this page open. It takes a few seconds.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Lock() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.lock}><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>;
}
